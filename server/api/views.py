# server/api/views.py - COMPLETE VERSION
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
from datetime import datetime, timedelta, date, time
import json

from .models import (
    Reservation, ContactMessage, GalleryItem, Event, 
    EventType, VenueSpace, RestaurantSettings
)
from .serializers import (
    ReservationSerializer, ContactMessageSerializer, 
    GalleryItemSerializer, PublicGalleryItemSerializer,
    EventSerializer, PublicEventSerializer,
    EventTypeSerializer, VenueSpaceSerializer,
    CustomUserSerializer, LoginSerializer
)


class ReservationViewSet(viewsets.ModelViewSet):
    queryset = Reservation.objects.all()
    serializer_class = ReservationSerializer
    
    def get_permissions(self):
        """Allow creation without authentication, but require auth for other operations"""
        if self.action == 'create':
            permission_classes = [AllowAny]
        elif self.action in ['lookup']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    @action(detail=False, methods=['get'])
    def availability(self, request):
        """Get available time slots for a given date"""
        try:
            date_str = request.query_params.get('start_date')
            if not date_str:
                return Response(
                    {'error': 'start_date parameter is required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Parse the date
            try:
                requested_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            except ValueError:
                return Response(
                    {'error': 'Invalid date format. Use YYYY-MM-DD'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check if date is in the past
            if requested_date < timezone.now().date():
                return Response(
                    {'error': 'Cannot check availability for past dates'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Generate time slots (example: 5:00 PM to 10:00 PM)
            slots = []
            start_hour = 17  # 5 PM
            end_hour = 22    # 10 PM
            
            for hour in range(start_hour, end_hour + 1):
                for minute in [0, 30]:  # Every 30 minutes
                    if hour == end_hour and minute > 0:
                        break
                    
                    slot_time = time(hour, minute)
                    time_display = slot_time.strftime('%I:%M %p')
                    
                    # Check existing reservations
                    existing_reservations = Reservation.objects.filter(
                        date=requested_date,
                        time=slot_time,
                        status__in=['confirmed', 'seated', 'pending']
                    ).count()
                    
                    # Simple availability logic (max 5 tables per slot)
                    available = existing_reservations < 5
                    
                    slots.append({
                        'time': slot_time.strftime('%H:%M'),
                        'time_display': time_display,
                        'available': available,
                        'existing_reservations': existing_reservations
                    })
            
            return Response([{
                'date': requested_date,
                'slots': slots
            }])
            
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def lookup(self, request):
        """Look up reservations by email and phone"""
        email = request.query_params.get('email', '').lower()
        phone = request.query_params.get('phone', '')
        
        if not email or not phone:
            return Response(
                {'error': 'Both email and phone are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        reservations = Reservation.objects.filter(
            email=email,
            phone=phone
        ).order_by('-created_at')
        
        serializer = self.get_serializer(reservations, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a reservation"""
        try:
            reservation = self.get_object()
            reservation.status = 'cancelled'
            reservation.save()
            
            return Response({
                'message': 'Reservation cancelled successfully',
                'reservation': ReservationSerializer(reservation).data
            })
        except Reservation.DoesNotExist:
            return Response(
                {'error': 'Reservation not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )


class ContactMessageViewSet(viewsets.ModelViewSet):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    
    def get_permissions(self):
        """Allow creation without authentication"""
        if self.action == 'create':
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    @action(detail=True, methods=['patch'], permission_classes=[IsAuthenticated])
    def mark_read(self, request, pk=None):
        """Mark message as read"""
        try:
            message = self.get_object()
            message.is_read = True
            message.save()
            
            serializer = self.get_serializer(message)
            return Response(serializer.data)
        except ContactMessage.DoesNotExist:
            return Response(
                {'error': 'Message not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )


class GalleryItemViewSet(viewsets.ModelViewSet):
    queryset = GalleryItem.objects.all()
    serializer_class = GalleryItemSerializer
    parser_classes = (MultiPartParser, FormParser, JSONParser)
    
    def get_permissions(self):
        """Public access for list/retrieve, admin only for create/update/delete"""
        if self.action in ['list', 'retrieve', 'public', 'categories']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        """Filter queryset based on action and permissions"""
        if self.action in ['list', 'retrieve'] and not self.request.user.is_authenticated:
            # Public access - only show active items
            return GalleryItem.objects.filter(is_active=True)
        return GalleryItem.objects.all()
    
    def get_serializer_class(self):
        """Use different serializer for public access"""
        if self.action in ['public'] or not self.request.user.is_authenticated:
            return PublicGalleryItemSerializer
        return GalleryItemSerializer
    
    def list(self, request):
        """List gallery items with filtering options"""
        queryset = self.get_queryset()
        
        # Filter by category
        category = request.query_params.get('category')
        if category and category != 'all':
            queryset = queryset.filter(category=category)
        
        # Filter by featured status
        featured = request.query_params.get('featured')
        if featured == 'true':
            queryset = queryset.filter(is_featured=True)
        
        # Order by display_order and creation date
        queryset = queryset.order_by('display_order', '-created_at')
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def public(self, request):
        """Get public gallery items"""
        queryset = GalleryItem.objects.filter(is_active=True)
        
        # Filter by category
        category = request.query_params.get('category')
        if category and category != 'all':
            queryset = queryset.filter(category=category)
        
        # Filter by featured status
        featured = request.query_params.get('featured')
        if featured == 'true':
            queryset = queryset.filter(is_featured=True)
        
        # Order by featured first, then display order
        queryset = queryset.order_by('-is_featured', 'display_order', '-created_at')
        
        serializer = PublicGalleryItemSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def categories(self, request):
        """Get available categories with counts"""
        categories = GalleryItem.objects.filter(
            is_active=True
        ).values('category').annotate(
            count=Count('id')
        ).order_by('category')
        
        category_data = []
        for category in categories:
            display_name = dict(GalleryItem.CATEGORY_CHOICES).get(
                category['category'], 
                category['category']
            )
            category_data.append({
                'value': category['category'],
                'label': display_name,
                'count': category['count']
            })
        
        return Response(category_data)
    
    @action(detail=True, methods=['patch'], permission_classes=[IsAuthenticated])
    def toggle_featured(self, request, pk=None):
        """Toggle featured status of gallery item"""
        try:
            item = self.get_object()
            item.is_featured = not item.is_featured
            item.save()
            
            serializer = self.get_serializer(item)
            return Response(serializer.data)
            
        except GalleryItem.DoesNotExist:
            return Response(
                {'detail': 'Gallery item not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['patch'], permission_classes=[IsAuthenticated])
    def toggle_active(self, request, pk=None):
        """Toggle active status of gallery item"""
        try:
            item = self.get_object()
            item.is_active = not item.is_active
            item.save()
            
            serializer = self.get_serializer(item)
            return Response(serializer.data)
            
        except GalleryItem.DoesNotExist:
            return Response(
                {'detail': 'Gallery item not found'},
                status=status.HTTP_404_NOT_FOUND
            )


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
    
    def get_queryset(self):
        """Filter queryset based on action and permissions"""
        if self.action in ['list', 'retrieve'] and not self.request.user.is_authenticated:
            # Public access - only show active events
            return Event.objects.filter(is_active=True)
        return Event.objects.all()
    
    def get_serializer_class(self):
        """Use different serializer for public access"""
        if self.action in ['upcoming', 'featured', 'public'] or not self.request.user.is_authenticated:
            return PublicEventSerializer
        return EventSerializer
    
    def list(self, request):
        """List events with filtering options"""
        queryset = self.get_queryset()
        
        # Filter by event type
        event_type = request.query_params.get('event_type')
        if event_type:
            queryset = queryset.filter(event_type=event_type)
        
        # Filter by featured status
        featured = request.query_params.get('featured')
        if featured == 'true':
            queryset = queryset.filter(is_featured=True)
        
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
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
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


class EventTypeViewSet(viewsets.ModelViewSet):
    queryset = EventType.objects.all()
    serializer_class = EventTypeSerializer
    permission_classes = [IsAuthenticated]
    
    def get_permissions(self):
        """Public access for list/retrieve"""
        if self.action in ['list', 'retrieve']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]


class VenueSpaceViewSet(viewsets.ModelViewSet):
    queryset = VenueSpace.objects.all()
    serializer_class = VenueSpaceSerializer
    parser_classes = (MultiPartParser, FormParser, JSONParser)
    
    def get_permissions(self):
        """Public access for list/retrieve"""
        if self.action in ['list', 'retrieve']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]


# Authentication views
class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            data = response.data.copy()
            data['message'] = 'Login successful'
        return Response(data)


@api_view(['POST'])
@permission_classes([AllowAny])
def admin_login(request):
    """Admin login endpoint"""
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        
        if not user.is_staff:
            return Response(
                {'error': 'Admin access required'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': CustomUserSerializer(user).data,
            'message': 'Login successful'
        })
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_logout(request):
    """Admin logout endpoint"""
    try:
        refresh_token = request.data.get('refresh_token')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
        return Response({'message': 'Logout successful'})
    except Exception as e:
        return Response(
            {'error': 'Invalid token'}, 
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_analytics(request):
    """Get dashboard analytics data"""
    today = timezone.now().date()
    
    # Reservations analytics
    total_reservations = Reservation.objects.count()
    pending_reservations = Reservation.objects.filter(status='pending').count()
    today_reservations = Reservation.objects.filter(date=today).count()
    
    # Events analytics
    total_events = Event.objects.count()
    active_events = Event.objects.filter(is_active=True).count()
    upcoming_events = Event.objects.filter(
        is_active=True, 
        start_date__gte=today
    ).count()
    
    # Gallery analytics
    total_gallery_items = GalleryItem.objects.count()
    active_gallery_items = GalleryItem.objects.filter(is_active=True).count()
    featured_gallery_items = GalleryItem.objects.filter(
        is_active=True, 
        is_featured=True
    ).count()
    
    # Contact messages analytics
    total_messages = ContactMessage.objects.count()
    unread_messages = ContactMessage.objects.filter(is_read=False).count()
    
    return Response({
        'reservations': {
            'total': total_reservations,
            'pending': pending_reservations,
            'today': today_reservations,
        },
        'events': {
            'total': total_events,
            'active': active_events,
            'upcoming': upcoming_events,
        },
        'gallery': {
            'total': total_gallery_items,
            'active': active_gallery_items,
            'featured': featured_gallery_items,
        },
        'messages': {
            'total': total_messages,
            'unread': unread_messages,
        }
    })