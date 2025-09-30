# server/api/views/AdminViews.py - COMPLETE FIXED VERSION
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
from django.db.models import Count, Q, Sum, Avg
from django.core.exceptions import ValidationError
from datetime import datetime, timedelta, date, time

from api.models import Reservation, Event, GalleryItem, ContactMessage
from api.serializers import LoginSerializer, CustomUserSerializer


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
    """Get comprehensive dashboard analytics data matching frontend expectations"""
    today = timezone.now().date()
    thirty_days_ago = today - timedelta(days=30)
    seven_days_ago = today - timedelta(days=7)
    
    # Get reservations for the last 30 days
    recent_reservations = Reservation.objects.filter(
        date__gte=thirty_days_ago,
        date__lte=today
    )
    
    # Calculate monthly revenue (estimated at $50 per person)
    total_guests = recent_reservations.aggregate(
        total=Sum('party_size')
    )['total'] or 0
    estimated_revenue = total_guests * 50  # $50 per person estimate
    
    # Total reservations in last 30 days
    total_reservations_30d = recent_reservations.count()
    
    # Status breakdown
    status_breakdown = list(
        recent_reservations.values('status')
        .annotate(count=Count('id'))
        .order_by('status')
    )
    
    # Daily reservations for the last 7 days
    daily_reservations = []
    for i in range(7):
        day = today - timedelta(days=6-i)
        count = Reservation.objects.filter(date=day).count()
        daily_reservations.append({
            'date': day.isoformat(),
            'count': count
        })
    
    # Popular reservation times (top 5)
    popular_times_query = (
        recent_reservations
        .values('time')
        .annotate(count=Count('id'))
        .order_by('-count')[:5]
    )
    
    # Format times as strings
    popular_times = []
    for time_slot in popular_times_query:
        if time_slot['time']:
            popular_times.append({
                'time': time_slot['time'].strftime('%H:%M'),
                'count': time_slot['count']
            })
    
    # Average party size
    avg_party_size = recent_reservations.aggregate(
        avg=Avg('party_size')
    )['avg'] or 0
    
    # Capacity utilization calculation
    # Assuming 100 seats total and multiple time slots per day
    total_slots = 7 * 5  # 7 days * 5 time slots per day
    total_capacity = 100 * total_slots
    total_booked_seats = total_guests
    capacity_utilization = (total_booked_seats / total_capacity) if total_capacity > 0 else 0
    
    return Response({
        'monthly_revenue': float(estimated_revenue),
        'total_reservations_30d': total_reservations_30d,
        'status_breakdown': status_breakdown,
        'daily_reservations': daily_reservations,
        'popular_times': popular_times,
        'average_party_size': round(float(avg_party_size), 1),
        'capacity_utilization': round(capacity_utilization, 2),
    })