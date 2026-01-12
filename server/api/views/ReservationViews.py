# server/api/views.py - ENHANCED VERSION
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

from api.models import (
    Reservation,ContactMessage
)


from api.serializers import ContactMessageSerializer, ReservationSerializer

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
        
class ReservationViewSet(viewsets.ModelViewSet):
    queryset = Reservation.objects.all()
    serializer_class = ReservationSerializer
    
    def get_permissions(self):
        """Allow creation without authentication, but require auth for other operations"""
        if self.action == 'create':
            permission_classes = [AllowAny]
        elif self.action in ['lookup', 'retrieve']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        """Filter reservations based on query parameters"""
        queryset = Reservation.objects.all()

        if not self.request.user.is_authenticated and self.action not in ['create', 'lookup', 'retrieve']:
            return queryset.none()
        
        # Apply filters
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        date_filter = self.request.query_params.get('date')
        if date_filter:
            try:
                filter_date = datetime.strptime(date_filter, '%Y-%m-%d').date()
                queryset = queryset.filter(date=filter_date)
            except ValueError:
                pass
        
        date_from = self.request.query_params.get('date_from')
        if date_from:
            try:
                from_date = datetime.strptime(date_from, '%Y-%m-%d').date()
                queryset = queryset.filter(date__gte=from_date)
            except ValueError:
                pass
        
        date_to = self.request.query_params.get('date_to')
        if date_to:
            try:
                to_date = datetime.strptime(date_to, '%Y-%m-%d').date()
                queryset = queryset.filter(date__lte=to_date)
            except ValueError:
                pass
        
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(email__icontains=search) |
                Q(phone__icontains=search)
            )
        
        email = self.request.query_params.get('email')
        if email:
            queryset = queryset.filter(email__iexact=email)
        
        phone = self.request.query_params.get('phone')
        if phone:
            queryset = queryset.filter(phone=phone)
        
        return queryset.order_by('-created_at')
    
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
            email__iexact=email,
            phone=phone
        ).order_by('-created_at')
        
        serializer = self.get_serializer(reservations, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def stats(self, request):
        """Get reservation statistics for dashboard"""
        today = timezone.now().date()

        stats = {
            'total_reservations': Reservation.objects.count(),
            'confirmed_reservations': Reservation.objects.filter(status='confirmed').count(),
            'pending_reservations': Reservation.objects.filter(status='pending').count(),
            'cancelled_reservations': Reservation.objects.filter(status='cancelled').count(),
            'completed_reservations': Reservation.objects.filter(status='completed').count(),
            'seated_reservations': Reservation.objects.filter(status='seated').count(),
            'no_show_reservations': Reservation.objects.filter(status='no_show').count(),
            'today_reservations': Reservation.objects.filter(date=today).count(),
        }

        return Response(stats)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def dashboard(self, request):
        """Get dashboard data for admin panel"""
        today = timezone.now().date()
        tomorrow = today + timedelta(days=1)
        week_start = today - timedelta(days=7)

        # Today's reservations
        todays_reservations = Reservation.objects.filter(date=today).order_by('time')

        # Tomorrow's reservations
        tomorrows_reservations = Reservation.objects.filter(date=tomorrow).order_by('time')

        # Week stats
        week_reservations = Reservation.objects.filter(date__gte=week_start, date__lte=today)
        total_guests = week_reservations.aggregate(total=Count('party_size'))['total'] or 0

        # Status stats
        status_stats = list(
            Reservation.objects.values('status').annotate(count=Count('id'))
        )

        # Recent messages
        recent_messages = list(
            ContactMessage.objects.order_by('-created_at')[:5].values(
                'id', 'name', 'email', 'subject', 'message', 'is_read', 'created_at'
            )
        )

        # Unread messages count
        unread_messages_count = ContactMessage.objects.filter(is_read=False).count()

        return Response({
            'todays_reservations': ReservationSerializer(todays_reservations, many=True).data,
            'tomorrows_reservations': ReservationSerializer(tomorrows_reservations, many=True).data,
            'week_stats': {
                'total_reservations': week_reservations.count(),
                'total_guests': total_guests,
            },
            'status_stats': status_stats,
            'recent_messages': recent_messages,
            'unread_messages_count': unread_messages_count,
        })

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
