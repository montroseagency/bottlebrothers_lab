# server/api/serializers.py - COMPLETE FILE
from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.utils import timezone
from .models import (
    Reservation, ContactMessage, GalleryItem, Event, EventType, VenueSpace,
    MenuCategory, MenuItem, MenuItemVariant, FloorPlan, Table, TableAssignment,
    CustomerProfile, VIPMembership, Offer, Waitlist, SMSNotification,
    OTPVerification, ProcessedImage
)

class ReservationSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    is_past_date = serializers.ReadOnlyField()
    
    class Meta:
        model = Reservation
        fields = [
            'id', 'first_name', 'last_name', 'full_name', 'email', 'phone',
            'date', 'time', 'party_size', 'occasion', 'special_requests',
            'dietary_restrictions', 'status', 'created_at', 'updated_at', 'is_past_date'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_email(self, value):
        return value.lower()

    def validate_date(self, value):
        if value < timezone.now().date():
            raise serializers.ValidationError("Cannot make reservations for past dates.")
        return value

    def validate_party_size(self, value):
        if value < 1:
            raise serializers.ValidationError("Party size must be at least 1.")
        if value > 20:
            raise serializers.ValidationError("Party size cannot exceed 20 people.")
        return value

class MenuItemVariantSerializer(serializers.ModelSerializer):
    formatted_price = serializers.ReadOnlyField()
    
    class Meta:
        model = MenuItemVariant
        fields = [
            'id', 'name', 'description', 'price', 'formatted_price',
            'variant_type', 'display_order', 'is_available'
        ]
        read_only_fields = ['id']


class MenuItemSerializer(serializers.ModelSerializer):
    formatted_price = serializers.ReadOnlyField()
    image_url = serializers.SerializerMethodField()
    variants = MenuItemVariantSerializer(many=True, read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_type = serializers.CharField(source='category.category_type', read_only=True)
    
    class Meta:
        model = MenuItem
        fields = [
            'id', 'category', 'category_name', 'category_type', 'name', 
            'description', 'price', 'formatted_price', 'image', 'image_url',
            'dietary_info', 'tags', 'ingredients', 'allergens', 'calories',
            'preparation_time', 'is_available', 'is_featured', 'display_order',
            'has_variants', 'variants', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_image_url(self, obj):
        """Get the full URL for the menu item image"""
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None
    
    def validate_name(self, value):
        """Validate name"""
        if len(value.strip()) < 3:
            raise serializers.ValidationError("Name must be at least 3 characters long.")
        return value.strip()
    
    def validate_description(self, value):
        """Validate description"""
        if len(value.strip()) < 10:
            raise serializers.ValidationError("Description must be at least 10 characters long.")
        return value.strip()
    
    def validate_price(self, value):
        """Validate price"""
        if value <= 0:
            raise serializers.ValidationError("Price must be greater than 0.")
        return value


class PublicMenuItemSerializer(serializers.ModelSerializer):
    """Serializer for public menu display (limited fields)"""
    formatted_price = serializers.ReadOnlyField()
    image_url = serializers.SerializerMethodField()
    variants = MenuItemVariantSerializer(many=True, read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_type = serializers.CharField(source='category.category_type', read_only=True)
    
    class Meta:
        model = MenuItem
        fields = [
            'id', 'category_name', 'category_type', 'name', 'description', 
            'formatted_price', 'image_url', 'dietary_info', 'tags',
            'ingredients', 'allergens', 'is_featured', 'has_variants', 'variants'
        ]
    
    def get_image_url(self, obj):
        """Get the full URL for the menu item image"""
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class MenuCategorySerializer(serializers.ModelSerializer):
    menu_items = MenuItemSerializer(many=True, read_only=True)
    items_count = serializers.SerializerMethodField()
    
    class Meta:
        model = MenuCategory
        fields = [
            'id', 'name', 'category_type', 'description', 'icon',
            'display_order', 'is_active', 'items_count', 'menu_items',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_items_count(self, obj):
        """Get count of available menu items in this category"""
        return obj.menu_items.filter(is_available=True).count()
    
    def validate_name(self, value):
        """Validate name"""
        if len(value.strip()) < 2:
            raise serializers.ValidationError("Name must be at least 2 characters long.")
        return value.strip()


class PublicMenuCategorySerializer(serializers.ModelSerializer):
    """Serializer for public menu display (limited fields)"""
    menu_items = PublicMenuItemSerializer(many=True, read_only=True)
    items_count = serializers.SerializerMethodField()
    
    class Meta:
        model = MenuCategory
        fields = [
            'id', 'name', 'category_type', 'description', 'icon',
            'items_count', 'menu_items'
        ]
    
    def get_items_count(self, obj):
        """Get count of available menu items in this category"""
        return obj.menu_items.filter(is_available=True).count()
    
    def to_representation(self, instance):
        """Filter menu items to only show available ones"""
        data = super().to_representation(instance)
        if 'menu_items' in data:
            # Only include available items in public view
            available_items = [
                item for item in data['menu_items'] 
                if instance.menu_items.get(id=item['id']).is_available
            ]
            data['menu_items'] = available_items
        return data
    
class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = [
            'id', 'name', 'email', 'phone', 'subject', 'message',
            'event_date', 'guest_count', 'event_type', 'is_read',
            'is_replied', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'is_read', 'is_replied']

    def validate_email(self, value):
        return value.lower()

    def validate_guest_count(self, value):
        if value is not None and value < 1:
            raise serializers.ValidationError("Guest count must be at least 1.")
        return value


class GalleryItemSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = GalleryItem
        fields = [
            'id', 'title', 'description', 'image', 'image_url', 'category',
            'is_featured', 'display_order', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_image_url(self, obj):
        """Get the full URL for the gallery image"""
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


class PublicGalleryItemSerializer(serializers.ModelSerializer):
    """Serializer for public gallery display (limited fields)"""
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = GalleryItem
        fields = [
            'id', 'title', 'description', 'image_url', 'category', 'is_featured'
        ]
    
    def get_image_url(self, obj):
        """Get the full URL for the gallery image"""
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class EventSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    is_past_event = serializers.ReadOnlyField()
    price_formatted = serializers.ReadOnlyField()
    formatted_time = serializers.ReadOnlyField()
    duration_display = serializers.ReadOnlyField()
    
    class Meta:
        model = Event
        fields = [
            'id', 'title', 'description', 'image', 'image_url', 'event_type', 
            'start_date', 'end_date', 'start_time', 'end_time',
            'frequency', 'recurring_day', 'recurring_type', 'recurring_days',
            'recurring_until', 'price', 'price_display', 'formatted_price',
            'price_formatted', 'capacity', 'max_capacity', 'location',
            'booking_required', 'booking_url', 'is_featured', 'is_active', 
            'display_order', 'special_notes', 'special_instructions',
            'status', 'created_at', 'updated_at', 'is_past_event', 
            'formatted_time', 'duration_display'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_image_url(self, obj):
        """Get the full URL for the event image"""
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
    
    def validate(self, data):
        """Cross-field validation"""
        # Validate dates
        if data.get('end_date') and data.get('start_date'):
            if data['end_date'] < data['start_date']:
                raise serializers.ValidationError("End date cannot be before start date.")
        
        # Validate times
        if data.get('end_time') and data.get('start_time'):
            if data.get('start_date') == data.get('end_date', data.get('start_date')):
                if data['end_time'] <= data['start_time']:
                    raise serializers.ValidationError("End time must be after start time.")
        
        # Validate past dates for new events
        if data.get('start_date') and data['start_date'] < timezone.now().date():
            if not self.instance:  # Only for creation, not updates
                raise serializers.ValidationError("Cannot create events with past start dates.")
        
        return data


class PublicEventSerializer(serializers.ModelSerializer):
    """Serializer for public event display (limited fields)"""
    image_url = serializers.SerializerMethodField()
    price_formatted = serializers.ReadOnlyField()
    formatted_time = serializers.ReadOnlyField()
    duration_display = serializers.ReadOnlyField()
    
    class Meta:
        model = Event
        fields = [
            'id', 'title', 'description', 'image_url', 'event_type',
            'start_date', 'end_date', 'start_time', 'end_time',
            'frequency', 'recurring_day', 'recurring_type', 'recurring_days',
            'formatted_price', 'price_formatted', 'capacity', 'max_capacity', 
            'location', 'booking_required', 'booking_url', 'is_featured', 
            'formatted_time', 'duration_display', 'special_notes', 'status'
        ]
    
    def get_image_url(self, obj):
        """Get the full URL for the event image"""
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class EventTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventType
        fields = [
            'id', 'title', 'description', 'icon', 'features',
            'is_active', 'display_order', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class VenueSpaceSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = VenueSpace
        fields = [
            'id', 'name', 'description', 'capacity', 'max_capacity_number',
            'image', 'image_url', 'features', 'is_active', 'display_order',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_image_url(self, obj):
        """Get the full URL for the venue image"""
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_staff', 'is_superuser']


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

    def validate(self, data):
        username = data.get('username')
        password = data.get('password')

        if username and password:
            user = authenticate(username=username, password=password)
            if not user:
                raise serializers.ValidationError('Invalid credentials')
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled')
            data['user'] = user
        else:
            raise serializers.ValidationError('Must include username and password')

        return data


# ============ PHASE 4 MODEL SERIALIZERS ============

class FloorPlanSerializer(serializers.ModelSerializer):
    tables_count = serializers.SerializerMethodField()

    class Meta:
        model = FloorPlan
        fields = ['id', 'name', 'description', 'display_order', 'is_active',
                 'created_at', 'tables_count']
        read_only_fields = ['id', 'created_at']

    def get_tables_count(self, obj):
        return obj.tables.count()


class TableSerializer(serializers.ModelSerializer):
    floor_plan_name = serializers.CharField(source='floor_plan.name', read_only=True)
    is_currently_assigned = serializers.SerializerMethodField()

    class Meta:
        model = Table
        fields = [
            'id', 'floor_plan', 'floor_plan_name', 'table_number', 'capacity',
            'min_capacity', 'shape', 'position_x', 'position_y', 'is_available',
            'is_vip', 'notes', 'created_at', 'is_currently_assigned'
        ]
        read_only_fields = ['id', 'created_at']

    def get_is_currently_assigned(self, obj):
        """Check if table is currently assigned to an active reservation"""
        from django.utils import timezone
        now = timezone.now()
        # Check if table has any assignments for reservations happening today
        return obj.assignments.filter(
            reservation__date=now.date(),
            reservation__status__in=['confirmed', 'seated']
        ).exists()


class TableAssignmentSerializer(serializers.ModelSerializer):
    table_number = serializers.CharField(source='table.table_number', read_only=True)
    reservation_name = serializers.CharField(source='reservation.full_name', read_only=True)

    class Meta:
        model = TableAssignment
        fields = [
            'id', 'reservation', 'reservation_name', 'table', 'table_number',
            'assigned_at', 'notes'
        ]
        read_only_fields = ['id', 'assigned_at']


class CustomerProfileSerializer(serializers.ModelSerializer):
    favorite_table_number = serializers.CharField(source='favorite_table.table_number', read_only=True)
    tier_display = serializers.CharField(source='get_tier_display', read_only=True)

    class Meta:
        model = CustomerProfile
        fields = [
            'id', 'email', 'phone', 'first_name', 'last_name', 'tier', 'tier_display',
            'points', 'lifetime_visits', 'lifetime_spent', 'favorite_table',
            'favorite_table_number', 'dietary_preferences', 'special_occasions',
            'sms_notifications', 'email_notifications', 'is_vip', 'is_blacklisted',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_email(self, value):
        return value.lower()


class VIPMembershipSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.first_name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = VIPMembership
        fields = [
            'id', 'customer', 'customer_name', 'status', 'status_display',
            'membership_number', 'start_date', 'end_date', 'benefits'
        ]
        read_only_fields = ['id']


class OfferSerializer(serializers.ModelSerializer):
    is_valid = serializers.SerializerMethodField()
    uses_remaining = serializers.SerializerMethodField()

    class Meta:
        model = Offer
        fields = [
            'id', 'title', 'description', 'offer_type', 'discount_percentage',
            'promo_code', 'start_date', 'end_date', 'is_active', 'max_uses_total',
            'current_uses', 'is_valid', 'uses_remaining'
        ]
        read_only_fields = ['id', 'current_uses']

    def get_is_valid(self, obj):
        """Check if offer is currently valid"""
        from django.utils import timezone
        now = timezone.now().date()
        return (obj.is_active and
                obj.start_date <= now <= obj.end_date and
                (obj.max_uses_total is None or obj.current_uses < obj.max_uses_total))

    def get_uses_remaining(self, obj):
        """Get remaining uses"""
        if obj.max_uses_total is None:
            return None
        return max(0, obj.max_uses_total - obj.current_uses)


class WaitlistSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.first_name', read_only=True, allow_null=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Waitlist
        fields = [
            'id', 'customer', 'customer_name', 'name', 'phone', 'party_size',
            'status', 'status_display', 'estimated_wait_minutes', 'position',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class SMSNotificationSerializer(serializers.ModelSerializer):
    notification_type_display = serializers.CharField(source='get_notification_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = SMSNotification
        fields = [
            'id', 'recipient_phone', 'message', 'notification_type',
            'notification_type_display', 'status', 'status_display', 'twilio_sid',
            'error_message', 'reservation', 'sent_at', 'created_at'
        ]
        read_only_fields = ['id', 'sent_at', 'created_at']


class OTPVerificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = OTPVerification
        fields = ['id', 'phone', 'otp_code', 'is_verified', 'expires_at',
                 'attempts', 'created_at']
        read_only_fields = ['id', 'created_at']


class ProcessedImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = ProcessedImage
        fields = [
            'id', 'source_type', 'source_id', 'image', 'image_url', 'format',
            'size', 'width', 'height', 'file_size', 'blur_hash', 'lqip_data_url',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']

    def get_image_url(self, obj):
        """Get the full URL for the processed image"""
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None