# server/api/views.py - ENHANCED VERSION
import os
import logging
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.utils import timezone
from django.db.models import Count, Q
from django.core.exceptions import ValidationError
from django.conf import settings
from django.db import connection
from datetime import datetime, timedelta, date, time
import json
import uuid

from api.models import (Event)
from api.serializers import (EventSerializer, PublicEventSerializer)

logger = logging.getLogger(__name__)

# Check if video columns exist in database
def check_video_columns_exist():
    """Check if video columns exist in the api_event table"""
    try:
        with connection.cursor() as cursor:
            # Get table columns
            cursor.execute("""
                SELECT column_name FROM information_schema.columns
                WHERE table_name = 'api_event' AND column_name = 'video_original'
            """)
            result = cursor.fetchone()
            return result is not None
    except Exception as e:
        logger.warning(f"Could not check video columns: {e}")
        # Try SQLite syntax
        try:
            with connection.cursor() as cursor:
                cursor.execute("PRAGMA table_info(api_event)")
                columns = [row[1] for row in cursor.fetchall()]
                return 'video_original' in columns
        except Exception:
            return False

VIDEO_COLUMNS_EXIST = check_video_columns_exist()

# Video-related imports - optional, may fail if Celery/Redis not configured
try:
    from api.tasks import convert_event_video_to_webm
    from api.services.video_service import validate_video_file, generate_video_filename
    VIDEO_FEATURES_AVAILABLE = VIDEO_COLUMNS_EXIST  # Only available if columns exist too
except ImportError as e:
    logger.warning(f"Video features unavailable: {e}")
    VIDEO_FEATURES_AVAILABLE = False
    convert_event_video_to_webm = None
    validate_video_file = None
    generate_video_filename = None

if not VIDEO_COLUMNS_EXIST:
    logger.warning("Video columns not found in database. Run 'python manage.py migrate' to enable video features.")
class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    parser_classes = (MultiPartParser, FormParser, JSONParser)
    
    def get_permissions(self):
        """Public access for list/retrieve, admin only for create/update/delete"""
        if self.action in ['list', 'retrieve', 'upcoming', 'featured', 'public', 'types']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    # Video fields that may not exist in database if migration hasn't run
    VIDEO_FIELDS = {'video_original', 'video_webm', 'video_status', 'video_task_id', 'video_duration', 'video_error'}

    # Non-video fields that should always exist
    CORE_FIELDS = [
        'id', 'title', 'description', 'image', 'event_type', 'status',
        'start_date', 'end_date', 'start_time', 'end_time',
        'recurring_type', 'recurring_days', 'recurring_until',
        'frequency', 'recurring_day', 'price', 'formatted_price', 'price_display',
        'capacity', 'max_capacity', 'location', 'booking_required', 'booking_url',
        'is_featured', 'is_active', 'display_order', 'special_notes', 'special_instructions',
        'created_at', 'updated_at'
    ]

    def get_queryset(self):
        """Filter queryset based on action and permissions"""
        if self.action in ['list', 'retrieve'] and not self.request.user.is_authenticated:
            # Public access - only show active events
            queryset = Event.objects.filter(is_active=True)
        else:
            queryset = Event.objects.all()

        # Use only() to specify exact fields when video columns don't exist
        # This prevents Django from trying to SELECT non-existent columns
        if not VIDEO_COLUMNS_EXIST:
            queryset = queryset.only(*self.CORE_FIELDS)

        return queryset
    
    def get_serializer_class(self):
        """Use different serializer for public access"""
        if self.action in ['upcoming', 'featured', 'public'] or not self.request.user.is_authenticated:
            return PublicEventSerializer
        return EventSerializer
    
    def list(self, request):
        """List events with filtering options"""
        try:
            queryset = self.get_queryset()

            # Filter by event type
            event_type = request.query_params.get('event_type')
            if event_type:
                queryset = queryset.filter(event_type=event_type)

            # Filter by featured status
            featured = request.query_params.get('featured')
            is_featured = request.query_params.get('is_featured')
            if featured == 'true' or is_featured == 'true':
                queryset = queryset.filter(is_featured=True)

            # Filter by status (upcoming, active, completed, cancelled)
            event_status = request.query_params.get('status')
            if event_status:
                if event_status == 'upcoming':
                    # Upcoming events: start_date >= today
                    today = timezone.now().date()
                    queryset = queryset.filter(start_date__gte=today)
                else:
                    queryset = queryset.filter(status=event_status)

            # Filter by date range
            start_date = request.query_params.get('start_date')
            end_date = request.query_params.get('end_date')
            if start_date:
                try:
                    start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
                    queryset = queryset.filter(start_date__gte=start_date)
                except ValueError:
                    pass
            if end_date:
                try:
                    end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
                    queryset = queryset.filter(start_date__lte=end_date)
                except ValueError:
                    pass

            # Order by display_order and start_date
            queryset = queryset.order_by('display_order', 'start_date', 'start_time')

            # Apply limit if specified
            limit = request.query_params.get('limit')
            if limit:
                try:
                    limit = int(limit)
                    queryset = queryset[:limit]
                except (ValueError, TypeError):
                    pass

            serializer = self.get_serializer(queryset, many=True, context={'request': request})

            # Return paginated response format expected by client
            return Response({
                'results': serializer.data,
                'count': len(serializer.data)
            })
        except Exception as e:
            logger.exception(f"Error listing events: {e}")
            return Response(
                {'detail': f'Error fetching events: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Get upcoming events for the public events page"""
        today = timezone.now().date()
        queryset = Event.objects.filter(
            is_active=True,
            start_date__gte=today
        ).order_by('display_order', 'start_date', 'start_time')
        
        # Limit results for performance
        limit = request.query_params.get('limit', 20)
        try:
            limit = int(limit)
            queryset = queryset[:limit]
        except (ValueError, TypeError):
            queryset = queryset[:20]
        
        serializer = PublicEventSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Get featured events"""
        today = timezone.now().date()
        queryset = Event.objects.filter(
            is_active=True,
            is_featured=True,
            start_date__gte=today
        ).order_by('display_order', 'start_date', 'start_time')[:5]
        
        serializer = PublicEventSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def public(self, request):
        """Get public events with comprehensive filtering"""
        today = timezone.now().date()
        queryset = Event.objects.filter(
            is_active=True
        )
        
        # Filter by upcoming events only (not past)
        queryset = queryset.filter(start_date__gte=today)
        
        # Filter by event type if requested
        event_type = request.query_params.get('event_type')
        if event_type:
            queryset = queryset.filter(event_type=event_type)
        
        # Filter by featured if requested
        featured = request.query_params.get('featured')
        if featured == 'true':
            queryset = queryset.filter(is_featured=True)
        
        # Order by featured first, then display order, then date
        queryset = queryset.order_by('-is_featured', 'display_order', 'start_date', 'start_time')
        
        serializer = PublicEventSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def types(self, request):
        """Get available event types with counts"""
        event_types = Event.objects.filter(
            is_active=True,
            start_date__gte=timezone.now().date()
        ).values('event_type').annotate(
            count=Count('id')
        ).order_by('event_type')
        
        type_data = []
        for event_type in event_types:
            display_name = dict(Event.EVENT_TYPE_CHOICES).get(
                event_type['event_type'], 
                event_type['event_type']
            )
            type_data.append({
                'value': event_type['event_type'],
                'label': display_name,
                'count': event_type['count']
            })
        
        return Response(type_data)
    
    @action(detail=True, methods=['patch'], permission_classes=[IsAuthenticated])
    def toggle_active(self, request, pk=None):
        """Toggle active status of event"""
        try:
            event = self.get_object()
            event.is_active = not event.is_active
            event.save()
            
            serializer = self.get_serializer(event)
            return Response(serializer.data)
            
        except Event.DoesNotExist:
            return Response(
                {'detail': 'Event not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['patch'], permission_classes=[IsAuthenticated])
    def toggle_featured(self, request, pk=None):
        """Toggle featured status of event"""
        try:
            event = self.get_object()
            event.is_featured = not event.is_featured
            event.save()

            serializer = self.get_serializer(event)
            return Response(serializer.data)

        except Event.DoesNotExist:
            return Response(
                {'detail': 'Event not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated],
            parser_classes=[MultiPartParser, FormParser])
    def upload_video(self, request, pk=None):
        """
        Upload a video for an event and trigger MP4 to WebM conversion.
        Accepts MP4 files up to 100MB.
        """
        # Check if video features are available
        if not VIDEO_FEATURES_AVAILABLE:
            return Response(
                {'detail': 'Video features are not available. Please ensure Celery and Redis are configured.'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

        try:
            event = self.get_object()
        except Event.DoesNotExist:
            return Response(
                {'detail': 'Event not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Check if there's already a video being processed
        if event.video_status == 'processing':
            return Response(
                {'detail': 'A video is already being processed for this event'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get the uploaded file
        video_file = request.FILES.get('video')
        if not video_file:
            return Response(
                {'detail': 'No video file provided'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate file type
        allowed_types = getattr(settings, 'ALLOWED_VIDEO_TYPES', ['video/mp4'])
        if video_file.content_type not in allowed_types:
            return Response(
                {'detail': f'Invalid file type. Allowed types: {", ".join(allowed_types)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate file size
        max_size = getattr(settings, 'MAX_VIDEO_SIZE', 100 * 1024 * 1024)
        if video_file.size > max_size:
            return Response(
                {'detail': f'File too large. Maximum size: {max_size // (1024*1024)}MB'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Delete old video files if they exist
            if event.video_original:
                try:
                    old_path = event.video_original.path
                    if os.path.exists(old_path):
                        os.remove(old_path)
                except Exception as e:
                    logger.warning(f"Could not delete old original video: {e}")

            if event.video_webm:
                try:
                    old_webm_path = event.video_webm.path
                    if os.path.exists(old_webm_path):
                        os.remove(old_webm_path)
                except Exception as e:
                    logger.warning(f"Could not delete old webm video: {e}")

            # Generate unique filename
            filename = generate_video_filename(video_file.name, 'mp4')

            # Save the uploaded file
            video_dir = os.path.join(settings.MEDIA_ROOT, 'events', 'videos', 'original')
            os.makedirs(video_dir, exist_ok=True)
            video_path = os.path.join(video_dir, filename)

            # Write file in chunks
            with open(video_path, 'wb+') as destination:
                for chunk in video_file.chunks():
                    destination.write(chunk)

            # Update event with video info
            event.video_original.name = f'events/videos/original/{filename}'
            event.video_webm = None
            event.video_status = 'uploading'
            event.video_error = None
            event.video_duration = None
            event.save(update_fields=[
                'video_original', 'video_webm', 'video_status',
                'video_error', 'video_duration'
            ])

            # Trigger Celery task for conversion
            task = convert_event_video_to_webm.delay(str(event.id))

            # Update with task ID
            event.video_task_id = task.id
            event.video_status = 'processing'
            event.save(update_fields=['video_task_id', 'video_status'])

            logger.info(f"Video upload started for event {event.id}, task {task.id}")

            serializer = self.get_serializer(event)
            return Response({
                'detail': 'Video uploaded successfully. Conversion started.',
                'task_id': task.id,
                'event': serializer.data
            }, status=status.HTTP_202_ACCEPTED)

        except Exception as e:
            logger.exception(f"Error uploading video for event {pk}")
            event.video_status = 'failed'
            event.video_error = str(e)
            event.save(update_fields=['video_status', 'video_error'])
            return Response(
                {'detail': f'Error uploading video: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def video_status(self, request, pk=None):
        """Get the current video conversion status for an event."""
        try:
            event = self.get_object()
        except Event.DoesNotExist:
            return Response(
                {'detail': 'Event not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        response_data = {
            'status': event.video_status,
            'task_id': event.video_task_id,
            'error': event.video_error,
            'duration': event.video_duration,
            'video_original_url': None,
            'video_webm_url': None
        }

        if event.video_original:
            response_data['video_original_url'] = request.build_absolute_uri(
                event.video_original.url
            )

        if event.video_webm:
            response_data['video_webm_url'] = request.build_absolute_uri(
                event.video_webm.url
            )

        return Response(response_data)

    @action(detail=True, methods=['delete'], permission_classes=[IsAuthenticated])
    def delete_video(self, request, pk=None):
        """Delete video files for an event."""
        try:
            event = self.get_object()
        except Event.DoesNotExist:
            return Response(
                {'detail': 'Event not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Don't delete while processing
        if event.video_status == 'processing':
            return Response(
                {'detail': 'Cannot delete video while conversion is in progress'},
                status=status.HTTP_400_BAD_REQUEST
            )

        deleted_files = []

        # Delete original video
        if event.video_original:
            try:
                original_path = event.video_original.path
                if os.path.exists(original_path):
                    os.remove(original_path)
                    deleted_files.append('original')
            except Exception as e:
                logger.warning(f"Could not delete original video: {e}")

        # Delete WebM video
        if event.video_webm:
            try:
                webm_path = event.video_webm.path
                if os.path.exists(webm_path):
                    os.remove(webm_path)
                    deleted_files.append('webm')
            except Exception as e:
                logger.warning(f"Could not delete webm video: {e}")

        # Reset video fields
        event.video_original = None
        event.video_webm = None
        event.video_status = 'none'
        event.video_task_id = None
        event.video_duration = None
        event.video_error = None
        event.save(update_fields=[
            'video_original', 'video_webm', 'video_status',
            'video_task_id', 'video_duration', 'video_error'
        ])

        logger.info(f"Video deleted for event {event.id}")

        return Response({
            'detail': 'Video deleted successfully',
            'deleted_files': deleted_files
        })