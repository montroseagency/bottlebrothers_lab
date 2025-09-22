# Add this to server/api/serializers.py (after the existing serializers)

class EventSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    is_past_event = serializers.ReadOnlyField()
    formatted_price = serializers.ReadOnlyField()
    duration_display = serializers.ReadOnlyField()
    
    class Meta:
        model = Event
        fields = [
            'id', 'title', 'description', 'image', 'image_url', 'event_type', 
            'status', 'start_date', 'end_date', 'start_time', 'end_time',
            'recurring_type', 'recurring_days', 'recurring_until', 'price', 
            'formatted_price', 'capacity', 'location', 'booking_required', 
            'booking_url', 'special_instructions', 'is_featured', 'display_order', 
            'is_active', 'created_at', 'updated_at', 'is_past_event', 'duration_display'
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
            if data['end_time'] <= data['start_time']:
                raise serializers.ValidationError("End time must be after start time.")
        
        # Validate recurring events
        if data.get('recurring_type') != 'none' and not data.get('recurring_until'):
            raise serializers.ValidationError("Recurring until date is required for recurring events.")
        
        # Validate past dates for new events
        if data.get('start_date') and data['start_date'] < timezone.now().date():
            if not self.instance:  # Only for creation, not updates
                raise serializers.ValidationError("Cannot create events with past start dates.")
        
        return data


class PublicEventSerializer(serializers.ModelSerializer):
    """Serializer for public event display (limited fields)"""
    image_url = serializers.SerializerMethodField()
    formatted_price = serializers.ReadOnlyField()
    duration_display = serializers.ReadOnlyField()
    
    class Meta:
        model = Event
        fields = [
            'id', 'title', 'description', 'image_url', 'event_type',
            'start_date', 'end_date', 'start_time', 'end_time',
            'recurring_type', 'recurring_days', 'formatted_price', 
            'capacity', 'location', 'booking_required', 'booking_url',
            'is_featured', 'duration_display'
        ]
    
    def get_image_url(self, obj):
        """Get the full URL for the event image"""
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None