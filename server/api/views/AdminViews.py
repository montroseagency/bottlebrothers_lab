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
    Reservation, Event, GalleryItem, ContactMessage
)
from api.serializers import (
  LoginSerializer, CustomUserSerializer,
)


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
    confirmed_reservations = Reservation.objects.filter(status='confirmed').count()
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
            'confirmed': confirmed_reservations,
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