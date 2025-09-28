# server/api/serializers.py - COMPLETE FILE
from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.utils import timezone
from .models import Reservation, ContactMessage, GalleryItem, Event, EventType, VenueSpace, MenuCategory, MenuItem, MenuItemVariant

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