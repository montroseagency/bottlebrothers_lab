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
from django.core.mail import send_mail
from django.conf import settings
from datetime import datetime, timedelta, date, time
import json
import logging

logger = logging.getLogger(__name__)

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

    def perform_create(self, serializer):
        """Create reservation and send confirmation email"""
        reservation = serializer.save()
        self.send_confirmation_email(reservation)

    def send_confirmation_email(self, reservation):
        """Send reservation confirmation email to customer"""
        try:
            subject = f'Reservation Confirmation - {reservation.verification_code}'

            formatted_date = reservation.date.strftime('%A, %B %d, %Y')
            formatted_time = reservation.time.strftime('%I:%M %p')

            message = f"""
Dear {reservation.first_name} {reservation.last_name},

Thank you for your reservation at Sunlake Villa!

RESERVATION DETAILS
========================================

Confirmation Code: {reservation.verification_code}

Date: {formatted_date}
Time: {formatted_time}
Party Size: {reservation.party_size} guests
{f"Occasion: {reservation.occasion}" if reservation.occasion else ""}
{f"Special Requests: {reservation.special_requests}" if reservation.special_requests else ""}

========================================

IMPORTANT INFORMATION:
- Please arrive 10 minutes before your reservation time
- Your table will be held for 15 minutes after the reservation time
- To modify or cancel, use your confirmation code: {reservation.verification_code}

CONTACT US:
Phone: +355 69 383 0639
Email: villasunlake@gmail.com
Address: Panorama e Liqenit, Liqeni i Farkes, Tirane, Albania

We look forward to welcoming you!

Best regards,
Sunlake Villa Team
"""

            html_message = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #1a1a1a 0%, #333 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
        .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
        .code-box {{ background: #fff; border: 2px dashed #22c55e; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }}
        .code {{ font-size: 28px; font-weight: bold; color: #22c55e; letter-spacing: 3px; }}
        .details {{ background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }}
        .detail-row {{ display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }}
        .footer {{ text-align: center; padding: 20px; color: #666; font-size: 14px; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0;">Reservation Confirmed!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Sunlake Villa</p>
        </div>
        <div class="content">
            <p>Dear {reservation.first_name},</p>
            <p>Thank you for your reservation. We're excited to welcome you!</p>

            <div class="code-box">
                <p style="margin: 0 0 10px 0; color: #666;">Your Confirmation Code</p>
                <div class="code">{reservation.verification_code}</div>
            </div>

            <div class="details">
                <h3 style="margin-top: 0;">Reservation Details</h3>
                <div class="detail-row">
                    <span><strong>Date:</strong></span>
                    <span>{formatted_date}</span>
                </div>
                <div class="detail-row">
                    <span><strong>Time:</strong></span>
                    <span>{formatted_time}</span>
                </div>
                <div class="detail-row">
                    <span><strong>Party Size:</strong></span>
                    <span>{reservation.party_size} guests</span>
                </div>
                {"<div class='detail-row'><span><strong>Occasion:</strong></span><span>" + reservation.occasion + "</span></div>" if reservation.occasion else ""}
            </div>

            <p><strong>Important:</strong> Please arrive 10 minutes before your reservation. Your table will be held for 15 minutes.</p>
        </div>
        <div class="footer">
            <p><strong>Sunlake Villa</strong></p>
            <p>Panorama e Liqenit, Liqeni i Farkes, Tirane, Albania</p>
            <p>+355 69 383 0639 | villasunlake@gmail.com</p>
        </div>
    </div>
</body>
</html>
"""

            send_mail(
                subject=subject,
                message=message,
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[reservation.email],
                html_message=html_message,
                fail_silently=False,
            )

            logger.info(f"Confirmation email sent to {reservation.email} for reservation {reservation.verification_code}")

        except Exception as e:
            logger.error(f"Failed to send confirmation email to {reservation.email}: {str(e)}")

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
