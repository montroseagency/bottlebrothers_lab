# server/api/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.contrib.auth import authenticate
from django.db.models import Q, Sum, Count, Avg
from django.db import models
from django.utils import timezone
from datetime import datetime, timedelta, time
import uuid

from .models import Reservation, ContactMessage, RestaurantSettings, GalleryItem
from .serializers import (
    ReservationSerializer, 
    ContactMessageSerializer,
    GalleryItemSerializer,
    DayAvailabilitySerializer,
    ReservationLookupSerializer,
    CustomTokenObtainPairSerializer,
    AdminDashboardSerializer
)


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class ReservationViewSet(viewsets.ModelViewSet):
    queryset = Reservation.objects.all()
    serializer_class = ReservationSerializer
    
    def get_permissions(self):
        """Allow public access for create, list only for authenticated admin"""
        if self.action in ['create', 'availability', 'lookup']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def create(self, request):
        """Create a new reservation"""
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            # Check availability before saving
            date = serializer.validated_data['date']
            time = serializer.validated_data['time']
            party_size = serializer.validated_data['party_size']
            
            if not self._check_availability(date, time, party_size):
                return Response(
                    {'detail': 'This time slot is not available for the requested party size.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            reservation = serializer.save()
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def availability(self, request):
        """Get availability for a date range"""
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        if not start_date:
            return Response(
                {'detail': 'start_date parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
            if end_date:
                end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
            else:
                end_date = start_date
        except ValueError:
            return Response(
                {'detail': 'Invalid date format. Use YYYY-MM-DD'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        availability_data = []
        settings = RestaurantSettings.get_settings()
        
        current_date = start_date
        while current_date <= end_date:
            slots = self._get_day_availability(current_date, settings)
            availability_data.append({
                'date': current_date,
                'slots': slots
            })
            current_date += timedelta(days=1)
        
        serializer = DayAvailabilitySerializer(availability_data, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def lookup(self, request):
        """Lookup reservations by email and phone"""
        serializer = ReservationLookupSerializer(data=request.query_params)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        email = serializer.validated_data['email']
        phone = serializer.validated_data['phone']
        
        reservations = Reservation.objects.filter(
            Q(email__iexact=email) & Q(phone=phone),
            date__gte=timezone.now().date()
        ).exclude(
            status='cancelled'
        ).order_by('date', 'time')
        
        serializer = ReservationSerializer(reservations, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a reservation"""
        try:
            reservation = self.get_object()
            
            settings = RestaurantSettings.get_settings()
            reservation_datetime = timezone.datetime.combine(
                reservation.date,
                reservation.time,
                tzinfo=timezone.get_current_timezone()
            )
            
            min_cancellation_time = reservation_datetime - timedelta(
                hours=settings.cancellation_hours
            )
            
            if timezone.now() > min_cancellation_time:
                return Response(
                    {'detail': f'Reservations must be cancelled at least {settings.cancellation_hours} hours in advance.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if reservation.status == 'cancelled':
                return Response(
                    {'detail': 'This reservation has already been cancelled.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            reservation.status = 'cancelled'
            reservation.save()
            
            return Response({'message': 'Reservation cancelled successfully'})
            
        except Reservation.DoesNotExist:
            return Response(
                {'detail': 'Reservation not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['patch'], permission_classes=[IsAuthenticated])
    def update_status(self, request, pk=None):
        """Update reservation status (admin only)"""
        try:
            reservation = self.get_object()
            new_status = request.data.get('status')
            
            if new_status not in dict(Reservation.STATUS_CHOICES):
                return Response(
                    {'detail': 'Invalid status'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            reservation.status = new_status
            reservation.save()
            
            serializer = ReservationSerializer(reservation)
            return Response(serializer.data)
            
        except Reservation.DoesNotExist:
            return Response(
                {'detail': 'Reservation not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def dashboard(self, request):
        """Get dashboard data for admin"""
        today = timezone.now().date()
        tomorrow = today + timedelta(days=1)
        this_week_start = today - timedelta(days=today.weekday())
        this_week_end = this_week_start + timedelta(days=6)
        
        # Today's reservations
        todays_reservations = Reservation.objects.filter(
            date=today
        ).exclude(status='cancelled').order_by('time')
        
        # Tomorrow's reservations
        tomorrows_reservations = Reservation.objects.filter(
            date=tomorrow
        ).exclude(status='cancelled').order_by('time')
        
        # This week's stats
        week_stats = Reservation.objects.filter(
            date__range=[this_week_start, this_week_end]
        ).exclude(status='cancelled').aggregate(
            total_reservations=Count('id'),
            total_guests=Sum('party_size')
        )
        
        # Status distribution
        status_stats = Reservation.objects.filter(
            date__gte=today
        ).exclude(status='cancelled').values('status').annotate(
            count=Count('id')
        )
        
        # Recent contact messages
        recent_messages = ContactMessage.objects.filter(
            is_read=False
        )[:5]
        
        dashboard_data = {
            'todays_reservations': ReservationSerializer(todays_reservations, many=True).data,
            'tomorrows_reservations': ReservationSerializer(tomorrows_reservations, many=True).data,
            'week_stats': week_stats,
            'status_stats': list(status_stats),
            'recent_messages': ContactMessageSerializer(recent_messages, many=True).data,
            'unread_messages_count': ContactMessage.objects.filter(is_read=False).count(),
            'gallery_items_count': GalleryItem.objects.filter(is_active=True).count(),
        }
        
        return Response(dashboard_data)
    
    def _check_availability(self, date, time, party_size):
        """Check if a time slot is available"""
        settings = RestaurantSettings.get_settings()
        
        existing_reservations = Reservation.objects.filter(
            date=date,
            time=time,
            status__in=['confirmed', 'seated']
        ).aggregate(
            total_guests=Sum('party_size')
        )
        
        current_capacity = existing_reservations['total_guests'] or 0
        available_capacity = settings.max_capacity - current_capacity
        
        return available_capacity >= party_size
    
    def _get_day_availability(self, date, settings):
        """Get availability slots for a specific day"""
        slots = []
        
        current_time = datetime.combine(date, settings.opening_time)
        closing_time = datetime.combine(date, settings.closing_time)
        
        while current_time <= closing_time - timedelta(hours=2):
            slot_time = current_time.time()
            
            existing_reservations = Reservation.objects.filter(
                date=date,
                time=slot_time,
                status__in=['confirmed', 'seated']
            ).aggregate(
                total_guests=Sum('party_size')
            )
            
            current_capacity = existing_reservations['total_guests'] or 0
            available_capacity = settings.max_capacity - current_capacity
            
            time_display = current_time.strftime('%-I:%M %p')
            
            slots.append({
                'time': slot_time,
                'time_display': time_display,
                'available_capacity': available_capacity,
                'is_available': available_capacity > 0
            })
            
            current_time += timedelta(minutes=30)
        
        return slots


class ContactMessageViewSet(viewsets.ModelViewSet):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    
    def get_permissions(self):
        """Allow public access for create, admin only for read/update"""
        if self.action == 'create':
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def create(self, request):
        """Create a new contact message"""
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            contact_message = serializer.save()
            
            return Response(
                {
                    'message': 'Your message has been received. We will contact you soon!',
                    'data': serializer.data
                },
                status=status.HTTP_201_CREATED
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['patch'], permission_classes=[IsAuthenticated])
    def mark_read(self, request, pk=None):
        """Mark message as read"""
        try:
            message = self.get_object()
            message.is_read = True
            message.save()
            
            serializer = ContactMessageSerializer(message)
            return Response(serializer.data)
            
        except ContactMessage.DoesNotExist:
            return Response(
                {'detail': 'Message not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['patch'], permission_classes=[IsAuthenticated])
    def mark_replied(self, request, pk=None):
        """Mark message as replied"""
        try:
            message = self.get_object()
            message.is_replied = True
            message.save()
            
            serializer = ContactMessageSerializer(message)
            return Response(serializer.data)
            
        except ContactMessage.DoesNotExist:
            return Response(
                {'detail': 'Message not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class GalleryItemViewSet(viewsets.ModelViewSet):
    queryset = GalleryItem.objects.all()
    serializer_class = GalleryItemSerializer
    parser_classes = (MultiPartParser, FormParser, JSONParser)
    
    def get_permissions(self):
        """Public access for list/retrieve, admin only for create/update/delete"""
        if self.action in ['list', 'retrieve', 'public']:
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
    
    def list(self, request):
        """List gallery items with filtering options"""
        queryset = self.get_queryset()
        
        # Filter by category
        category = request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category)
        
        # Filter by featured status
        featured = request.query_params.get('featured')
        if featured == 'true':
            queryset = queryset.filter(is_featured=True)
        
        # Order by display_order and created_at
        queryset = queryset.order_by('display_order', '-created_at')
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def public(self, request):
        """Get public gallery items for the frontend gallery page"""
        queryset = GalleryItem.objects.filter(is_active=True).order_by('display_order', '-created_at')
        
        # Filter by category if requested
        category = request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Get featured gallery items"""
        queryset = GalleryItem.objects.filter(is_active=True, is_featured=True).order_by('display_order')
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def categories(self, request):
        """Get available categories with counts"""
        categories = GalleryItem.objects.filter(is_active=True).values('category').annotate(
            count=Count('id')
        ).order_by('category')
        
        category_data = []
        for cat in categories:
            display_name = dict(GalleryItem.CATEGORY_CHOICES).get(cat['category'], cat['category'])
            category_data.append({
                'value': cat['category'],
                'label': display_name,
                'count': cat['count']
            })
        
        return Response(category_data)
    
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
    
    def perform_create(self, serializer):
        """Handle gallery item creation"""
        serializer.save()
    
    def perform_update(self, serializer):
        """Handle gallery item updates"""
        serializer.save()


@api_view(['POST'])
@permission_classes([AllowAny])
def admin_login(request):
    """Admin login endpoint"""
    username = request.data.get('username')
    password = request.data.get('password')
    
    if not username or not password:
        return Response(
            {'detail': 'Username and password required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    user = authenticate(username=username, password=password)
    
    if user and user.is_staff:
        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'is_staff': user.is_staff,
                'is_superuser': user.is_superuser,
            }
        })
    
    return Response(
        {'detail': 'Invalid credentials or insufficient permissions'},
        status=status.HTTP_401_UNAUTHORIZED
    )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_logout(request):
    """Admin logout endpoint"""
    try:
        refresh_token = request.data.get('refresh')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
        return Response({'message': 'Successfully logged out'})
    except Exception:
        return Response({'message': 'Logged out'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_analytics(request):
    """Get analytics data for dashboard"""
    today = timezone.now().date()
    last_30_days = today - timedelta(days=30)
    
    # Monthly revenue (estimated)
    monthly_reservations = Reservation.objects.filter(
        date__gte=last_30_days,
        status__in=['completed', 'confirmed', 'seated']
    )
    
    # Calculate estimated revenue (assuming $50 per person average)
    estimated_revenue = monthly_reservations.aggregate(
        total_guests=Sum('party_size')
    )['total_guests'] or 0
    estimated_revenue *= 50
    
    # Reservations by status
    status_breakdown = Reservation.objects.filter(
        date__gte=last_30_days
    ).values('status').annotate(count=Count('id'))
    
    # Daily reservations for the last 7 days
    daily_reservations = []
    for i in range(7):
        date = today - timedelta(days=i)
        count = Reservation.objects.filter(
            date=date
        ).exclude(status='cancelled').count()
        daily_reservations.append({
            'date': date.strftime('%Y-%m-%d'),
            'count': count
        })
    
    # Popular times
    popular_times = Reservation.objects.filter(
        date__gte=last_30_days
    ).exclude(status='cancelled').values('time').annotate(
        count=Count('id')
    ).order_by('-count')[:5]
    
    # Average party size
    avg_party_size = Reservation.objects.filter(
        date__gte=last_30_days
    ).exclude(status='cancelled').aggregate(
        avg_size=models.Avg('party_size')
    )['avg_size'] or 0
    
    # Gallery stats
    gallery_stats = {
        'total_items': GalleryItem.objects.count(),
        'active_items': GalleryItem.objects.filter(is_active=True).count(),
        'featured_items': GalleryItem.objects.filter(is_active=True, is_featured=True).count(),
        'by_category': list(GalleryItem.objects.filter(is_active=True).values('category').annotate(count=Count('id')))
    }
    
    analytics_data = {
        'monthly_revenue': estimated_revenue,
        'total_reservations_30d': monthly_reservations.count(),
        'status_breakdown': list(status_breakdown),
        'daily_reservations': list(reversed(daily_reservations)),
        'popular_times': list(popular_times),
        'average_party_size': round(avg_party_size, 1),
        'capacity_utilization': 0.75,  # This would need more complex calculation
        'gallery_stats': gallery_stats,
    }
    
    return Response(analytics_data)