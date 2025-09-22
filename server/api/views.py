# Add this to server/api/views.py (after the existing imports and before the existing viewsets)

from .models import Event
from .serializers import EventSerializer, PublicEventSerializer

# Add this class after the existing viewsets

class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    parser_classes = (MultiPartParser, FormParser, JSONParser)
    
    def get_permissions(self):
        """Public access for list/retrieve, admin only for create/update/delete"""
        if self.action in ['list', 'retrieve', 'upcoming', 'featured', 'public']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        """Filter queryset based on action and permissions"""
        if self.action in ['list', 'retrieve'] and not self.request.user.is_authenticated:
            # Public access - only show active events
            return Event.objects.filter(is_active=True, status='upcoming')
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
        
        # Filter by status
        status = request.query_params.get('status')
        if status:
            queryset = queryset.filter(status=status)
        
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
            status='upcoming',
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
            status='upcoming',
            start_date__gte=today
        ).order_by('display_order', 'start_date', 'start_time')[:5]
        
        serializer = PublicEventSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def public(self, request):
        """Get public events with comprehensive filtering"""
        today = timezone.now().date()
        queryset = Event.objects.filter(
            is_active=True,
            status='upcoming'
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
            status='upcoming'
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
    
    @action(detail=True, methods=['patch'], permission_classes=[IsAuthenticated])
    def update_status(self, request, pk=None):
        """Update event status"""
        try:
            event = self.get_object()
            new_status = request.data.get('status')
            
            if new_status not in dict(Event.STATUS_CHOICES):
                return Response(
                    {'detail': 'Invalid status'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            event.status = new_status
            event.save()
            
            serializer = self.get_serializer(event)
            return Response(serializer.data)
            
        except Event.DoesNotExist:
            return Response(
                {'detail': 'Event not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    def perform_create(self, serializer):
        """Handle event creation"""
        serializer.save()
    
    def perform_update(self, serializer):
        """Handle event updates"""
        serializer.save()