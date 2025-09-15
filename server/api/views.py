# server/api/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q, Sum
from django.utils import timezone
from datetime import datetime, timedelta, time
import uuid

from .models import Reservation, ContactMessage, RestaurantSettings
from .serializers import (
    ReservationSerializer, 
    ContactMessageSerializer,
    DayAvailabilitySerializer,
    ReservationLookupSerializer
)


class ReservationViewSet(viewsets.ModelViewSet):
    queryset = Reservation.objects.all()
    serializer_class = ReservationSerializer
    
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
            
            # Send confirmation email (optional)
            # self._send_confirmation_email(reservation)
            
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
        
        # Find reservations matching email AND phone
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
            
            # Check if reservation can be cancelled
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
            
            # Send cancellation email (optional)
            # self._send_cancellation_email(reservation)
            
            return Response({'message': 'Reservation cancelled successfully'})
            
        except Reservation.DoesNotExist:
            return Response(
                {'detail': 'Reservation not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    def _check_availability(self, date, time, party_size):
        """Check if a time slot is available"""
        settings = RestaurantSettings.get_settings()
        
        # Get all reservations for the same date and time
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
        
        # Generate time slots from opening to closing time
        current_time = datetime.combine(date, settings.opening_time)
        closing_time = datetime.combine(date, settings.closing_time)
        
        # 30-minute intervals
        while current_time <= closing_time - timedelta(hours=2):  # Last seating 2 hours before closing
            slot_time = current_time.time()
            
            # Get existing reservations for this slot
            existing_reservations = Reservation.objects.filter(
                date=date,
                time=slot_time,
                status__in=['confirmed', 'seated']
            ).aggregate(
                total_guests=Sum('party_size')
            )
            
            current_capacity = existing_reservations['total_guests'] or 0
            available_capacity = settings.max_capacity - current_capacity
            
            # Format time for display
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
    http_method_names = ['post', 'get']  # Only allow creating and reading
    
    def create(self, request):
        """Create a new contact message"""
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            contact_message = serializer.save()
            
            # Send notification email to restaurant (optional)
            # self._send_notification_email(contact_message)
            
            # Send confirmation email to customer (optional)
            # self._send_confirmation_email(contact_message)
            
            return Response(
                {
                    'message': 'Your message has been received. We will contact you soon!',
                    'data': serializer.data
                },
                status=status.HTTP_201_CREATED
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)