# server/api/serializers.py
from rest_framework import serializers
from .models import Reservation, ContactMessage, RestaurantSettings
from django.utils import timezone
from datetime import datetime, timedelta


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
        read_only_fields = ['id', 'created_at', 'updated_at', 'status']
    
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
        # Check if datetime is not in the past
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
            'event_date', 'guest_count', 'event_type', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def validate_event_date(self, value):
        """Validate event date for private events"""
        if value and value < timezone.now().date():
            raise serializers.ValidationError("Event date cannot be in the past.")
        return value
    
    def validate(self, data):
        """Cross-field validation"""
        # If it's a private event, require event details
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