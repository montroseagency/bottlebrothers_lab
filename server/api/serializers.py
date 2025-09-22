# server/api/serializers.py
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.models import User
from .models import Reservation, ContactMessage, RestaurantSettings, GalleryItem
from django.utils import timezone
from datetime import datetime, timedelta


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims
        token['username'] = user.username
        token['is_staff'] = user.is_staff
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Check if user is staff
        if not self.user.is_staff:
            raise serializers.ValidationError('Access denied. Admin privileges required.')
        
        # Add user data to response
        data.update({
            'user': {
                'id': self.user.id,
                'username': self.user.username,
                'email': self.user.email,
                'is_staff': self.user.is_staff,
                'is_superuser': self.user.is_superuser,
            }
        })
        return data


class ReservationSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    is_past_date = serializers.ReadOnlyField()
    
    class Meta:
        model = Reservation
        fields = [
            'id', 'first_name', 'last_name', 'full_name', 'email', 'phone',
            'date', 'time', 'party_size', 'occasion', 'special_requests',
            'dietary_restrictions', 'status', 'created_at', 'updated_at',
            'is_past_date'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate_date(self, value):
        """Validate that the reservation date is not in the past"""
        if value < timezone.now().date():
            raise serializers.ValidationError("Reservation date cannot be in the past.")
        
        # Check if date is within advance booking window
        settings = RestaurantSettings.get_settings()
        max_date = timezone.now().date() + timedelta(days=settings.advance_booking_days)
        if value > max_date:
            raise serializers.ValidationError(
                f"Reservations can only be made up to {settings.advance_booking_days} days in advance."
            )
        
        return value
    
    def validate_time(self, value):
        """Validate that the reservation time is within operating hours"""
        settings = RestaurantSettings.get_settings()
        if value < settings.opening_time or value > settings.closing_time:
            raise serializers.ValidationError(
                f"Reservation time must be between {settings.opening_time} and {settings.closing_time}."
            )
        return value
    
    def validate_party_size(self, value):
        """Validate party size"""
        settings = RestaurantSettings.get_settings()
        if value < settings.min_party_size or value > settings.max_party_size:
            raise serializers.ValidationError(
                f"Party size must be between {settings.min_party_size} and {settings.max_party_size}."
            )
        return value
    
    def validate(self, data):
        """Cross-field validation"""
        if 'date' in data and 'time' in data:
            reservation_datetime = timezone.datetime.combine(
                data['date'],
                data['time'],
                tzinfo=timezone.get_current_timezone()
            )
            if reservation_datetime < timezone.now():
                raise serializers.ValidationError("Reservation cannot be in the past.")
        
        return data


class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = [
            'id', 'name', 'email', 'phone', 'subject', 'message',
            'event_date', 'guest_count', 'event_type', 'is_read', 
            'is_replied', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def validate_event_date(self, value):
        """Validate event date for private events"""
        if value and value < timezone.now().date():
            raise serializers.ValidationError("Event date cannot be in the past.")
        return value
    
    def validate(self, data):
        """Cross-field validation"""
        if data.get('subject') in ['private_event', 'catering', 'corporate']:
            if not data.get('event_date'):
                raise serializers.ValidationError({
                    'event_date': 'Event date is required for private events.'
                })
            if not data.get('guest_count'):
                raise serializers.ValidationError({
                    'guest_count': 'Guest count is required for private events.'
                })
        
        return data


class GalleryItemSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = GalleryItem
        fields = [
            'id', 'title', 'description', 'image', 'image_url', 'category',
            'is_featured', 'display_order', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'image_url']
    
    def get_image_url(self, obj):
        """Get the full URL for the image"""
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None
    
    def validate_title(self, value):
        """Validate title"""
        if len(value.strip()) < 3:
            raise serializers.ValidationError("Title must be at least 3 characters long.")
        return value.strip()
    
    def validate_description(self, value):
        """Validate description"""
        if len(value.strip()) < 10:
            raise serializers.ValidationError("Description must be at least 10 characters long.")
        return value.strip()
    
    def validate_display_order(self, value):
        """Validate display order"""
        if value < 0:
            raise serializers.ValidationError("Display order must be 0 or positive.")
        return value


class AvailabilitySlotSerializer(serializers.Serializer):
    time = serializers.TimeField()
    time_display = serializers.CharField()
    available_capacity = serializers.IntegerField()
    is_available = serializers.BooleanField()


class DayAvailabilitySerializer(serializers.Serializer):
    date = serializers.DateField()
    slots = AvailabilitySlotSerializer(many=True)


class ReservationLookupSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    phone = serializers.CharField(required=True)


class AdminLoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'is_staff', 'is_superuser', 'date_joined']
        read_only_fields = ['id', 'date_joined']


class DashboardStatsSerializer(serializers.Serializer):
    total_reservations = serializers.IntegerField()
    total_guests = serializers.IntegerField()
    pending_reservations = serializers.IntegerField()
    confirmed_reservations = serializers.IntegerField()
    completed_reservations = serializers.IntegerField()
    cancelled_reservations = serializers.IntegerField()
    unread_messages = serializers.IntegerField()
    monthly_revenue = serializers.DecimalField(max_digits=10, decimal_places=2)
    capacity_utilization = serializers.FloatField()


class AdminDashboardSerializer(serializers.Serializer):
    todays_reservations = ReservationSerializer(many=True)
    tomorrows_reservations = ReservationSerializer(many=True)
    week_stats = serializers.DictField()
    status_stats = serializers.ListField()
    recent_messages = ContactMessageSerializer(many=True)
    unread_messages_count = serializers.IntegerField()
    gallery_items_count = serializers.IntegerField()