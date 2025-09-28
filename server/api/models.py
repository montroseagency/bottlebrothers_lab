# server/api/models.py - UPDATED WITH FRONTEND COMPATIBILITY
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
import uuid
import os

def gallery_image_path(instance, filename):
    """Generate file path for gallery images"""
    ext = filename.split('.')[-1]
    filename = f"{uuid.uuid4().hex}.{ext}"
    return os.path.join('gallery', filename)

def event_image_path(instance, filename):
    """Generate file path for event images"""
    ext = filename.split('.')[-1]
    filename = f"{uuid.uuid4().hex}.{ext}"
    return os.path.join('events', filename)

def venue_image_path(instance, filename):
    """Generate file path for venue images"""
    ext = filename.split('.')[-1]
    filename = f"{uuid.uuid4().hex}.{ext}"
    return os.path.join('venues', filename)

class Reservation(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('seated', 'Seated'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('no_show', 'No Show'),
    ]
    
    OCCASION_CHOICES = [
        ('birthday', 'Birthday Celebration'),
        ('anniversary', 'Anniversary'),
        ('business', 'Business Meeting'),
        ('date', 'Date Night'),
        ('family', 'Family Gathering'),
        ('celebration', 'Special Celebration'),
        ('casual', 'Casual Dining'),
        ('other', 'Other'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    date = models.DateField()
    time = models.TimeField()
    party_size = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(20)]
    )
    occasion = models.CharField(
        max_length=20, 
        choices=OCCASION_CHOICES, 
        blank=True, 
        null=True
    )
    special_requests = models.TextField(max_length=500, blank=True, null=True)
    dietary_restrictions = models.TextField(max_length=300, blank=True, null=True)
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='pending'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-date', '-time']
        indexes = [
            models.Index(fields=['email', 'phone']),
            models.Index(fields=['date', 'time']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} - {self.date} at {self.time}"
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"
    
    @property
    def is_past_date(self):
        reservation_datetime = timezone.datetime.combine(
            self.date, 
            self.time,
            tzinfo=timezone.get_current_timezone()
        )
        return reservation_datetime < timezone.now()
    
    def save(self, *args, **kwargs):
        # Auto-confirm reservations (you can add more logic here)
        if self.status == 'pending':
            self.status = 'confirmed'
        super().save(*args, **kwargs)


class ContactMessage(models.Model):
    SUBJECT_CHOICES = [
        ('reservation', 'Reservation Inquiry'),
        ('private_event', 'Private Event'),
        ('catering', 'Catering Services'),
        ('corporate', 'Corporate Booking'),
        ('feedback', 'Feedback'),
        ('general', 'General Inquiry'),
    ]
    
    EVENT_TYPE_CHOICES = [
        ('wedding', 'Wedding'),
        ('birthday', 'Birthday Party'),
        ('corporate', 'Corporate Event'),
        ('anniversary', 'Anniversary'),
        ('graduation', 'Graduation'),
        ('other', 'Other'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True, null=True)
    subject = models.CharField(max_length=20, choices=SUBJECT_CHOICES)
    message = models.TextField()
    event_date = models.DateField(blank=True, null=True)
    guest_count = models.IntegerField(
        blank=True, 
        null=True,
        validators=[MinValueValidator(1), MaxValueValidator(500)]
    )
    event_type = models.CharField(
        max_length=20, 
        choices=EVENT_TYPE_CHOICES, 
        blank=True, 
        null=True
    )
    is_read = models.BooleanField(default=False)
    is_replied = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} - {self.get_subject_display()}"


class GalleryItem(models.Model):
    """Model for gallery images and descriptions"""
    CATEGORY_CHOICES = [
        ('food', 'Food & Drinks'),
        ('interior', 'Interior Design'),
        ('events', 'Events & Celebrations'),
        ('cocktails', 'Cocktails'),
        ('atmosphere', 'Atmosphere'),
        ('other', 'Other'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200, help_text="Title of the image")
    description = models.TextField(help_text="Description that appears with the image")
    image = models.ImageField(upload_to=gallery_image_path, help_text="Upload gallery image")
    category = models.CharField(
        max_length=20,
        choices=CATEGORY_CHOICES,
        default='other',
        help_text="Category for organizing gallery items"
    )
    is_featured = models.BooleanField(
        default=False,
        help_text="Feature this image prominently in the gallery"
    )
    display_order = models.IntegerField(
        default=0,
        help_text="Order in which to display (lower numbers first)"
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Show this item in the public gallery"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['display_order', '-created_at']
        indexes = [
            models.Index(fields=['is_active', 'display_order']),
            models.Index(fields=['category', 'is_active']),
            models.Index(fields=['is_featured', 'is_active']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.get_category_display()}"
    
    def delete(self, *args, **kwargs):
        # Delete the image file when the model instance is deleted
        if self.image:
            self.image.delete(save=False)
        super().delete(*args, **kwargs)


class Event(models.Model):
    """Model for restaurant events - Compatible with frontend expectations"""
    EVENT_TYPE_CHOICES = [
        ('featured', 'Featured Event'),
        ('regular', 'Regular Event'),
        ('recurring', 'Recurring Event'),
    ]
    
    STATUS_CHOICES = [
        ('upcoming', 'Upcoming'),
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    RECURRING_TYPE_CHOICES = [
        ('none', 'One Time Only'),
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
    ]
    
    FREQUENCY_CHOICES = [
        ('once', 'One Time Only'),
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200, help_text="Event title")
    description = models.TextField(help_text="Event description")
    image = models.ImageField(upload_to=event_image_path, help_text="Event image")
    
    # Frontend expects these fields
    event_type = models.CharField(
        max_length=20,
        choices=EVENT_TYPE_CHOICES,
        default='regular',
        help_text="Type of event"
    )
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='upcoming',
        help_text="Event status"
    )
    
    # Date and time fields (frontend compatible)
    start_date = models.DateField(help_text="Event start date")
    end_date = models.DateField(blank=True, null=True, help_text="Event end date (for multi-day events)")
    start_time = models.TimeField(help_text="Event start time")
    end_time = models.TimeField(help_text="Event end time")
    
    # Recurring event fields (frontend compatible)
    recurring_type = models.CharField(
        max_length=20,
        choices=RECURRING_TYPE_CHOICES,
        default='none',
        help_text="How often this event occurs"
    )
    recurring_days = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="Days of week for recurring events (e.g., 'thursday', 'friday,saturday')"
    )
    recurring_until = models.DateField(
        blank=True, 
        null=True, 
        help_text="End date for recurring events"
    )
    
    # Legacy frequency field for backward compatibility
    frequency = models.CharField(
        max_length=20,
        choices=FREQUENCY_CHOICES,
        default='once',
        help_text="How often this event occurs (legacy field)"
    )
    recurring_day = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        help_text="Day of week for recurring events (legacy field)"
    )
    
    # Pricing and capacity (frontend compatible)
    price = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        default=0.00,
        help_text="Event price (0.00 for free events)"
    )
    formatted_price = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        help_text="Formatted price display (e.g., 'No Cover', '$10 Cover', '$65 per person')"
    )
    price_display = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        help_text="Custom price display (legacy field)"
    )
    
    # Frontend expects these fields
    capacity = models.IntegerField(
        blank=True,
        null=True,
        help_text="Maximum number of attendees"
    )
    max_capacity = models.IntegerField(
        blank=True,
        null=True,
        help_text="Maximum number of attendees (legacy field)"
    )
    
    location = models.CharField(
        max_length=200,
        default='Main Dining Hall',
        help_text="Event location"
    )
    
    booking_required = models.BooleanField(
        default=False,
        help_text="Whether booking is required for this event"
    )
    
    booking_url = models.URLField(
        blank=True,
        null=True,
        help_text="URL for booking this event"
    )
    
    # Display settings
    is_featured = models.BooleanField(
        default=False,
        help_text="Feature this event prominently"
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Show this event publicly"
    )
    display_order = models.IntegerField(
        default=0,
        help_text="Order in which to display (lower numbers first)"
    )
    
    # Additional details
    special_notes = models.TextField(
        blank=True,
        null=True,
        help_text="Any special notes or requirements"
    )
    special_instructions = models.TextField(
        blank=True,
        null=True,
        help_text="Special instructions (legacy field)"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['display_order', '-start_date', 'start_time']
        indexes = [
            models.Index(fields=['is_active', 'display_order']),
            models.Index(fields=['event_type', 'is_active']),
            models.Index(fields=['is_featured', 'is_active']),
            models.Index(fields=['start_date', 'is_active']),
            models.Index(fields=['status', 'is_active']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.start_date}"
    
    @property
    def formatted_time(self):
        """Return formatted time range - FIXED FOR WINDOWS COMPATIBILITY"""
        try:
            # Use cross-platform compatible format strings
            start_str = self.start_time.strftime('%I:%M %p').lstrip('0')
            end_str = self.end_time.strftime('%I:%M %p').lstrip('0')
            return f"{start_str} - {end_str}"
        except (AttributeError, ValueError) as e:
            # Fallback if there's any issue with time formatting
            return f"{self.start_time} - {self.end_time}"
    
    @property
    def duration_display(self):
        """Return formatted time range for frontend"""
        return self.formatted_time
    
    @property
    def is_past_event(self):
        """Check if event is in the past"""
        try:
            event_datetime = timezone.datetime.combine(
                self.start_date,
                self.start_time,
                tzinfo=timezone.get_current_timezone()
            )
            return event_datetime < timezone.now()
        except (AttributeError, ValueError):
            return False
    
    @property
    def price_formatted(self):
        """Return formatted price for frontend compatibility"""
        if self.formatted_price:
            return self.formatted_price
        elif self.price_display:
            return self.price_display
        elif self.price == 0:
            return "Free"
        else:
            return f"${self.price}"
    
    def save(self, *args, **kwargs):
        # Sync legacy fields
        if self.recurring_type != 'none' and not self.frequency:
            self.frequency = self.recurring_type
        if self.recurring_days and not self.recurring_day:
            self.recurring_day = self.recurring_days
        if self.capacity and not self.max_capacity:
            self.max_capacity = self.capacity
        elif self.max_capacity and not self.capacity:
            self.capacity = self.max_capacity
        if self.special_notes and not self.special_instructions:
            self.special_instructions = self.special_notes
        
        super().save(*args, **kwargs)
    
    def delete(self, *args, **kwargs):
        # Delete the image file when the model instance is deleted
        if self.image:
            self.image.delete(save=False)
        super().delete(*args, **kwargs)



class EventType(models.Model):
    """Model for different types of events the restaurant offers"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200, help_text="Event type title")
    description = models.TextField(help_text="Description of this event type")
    icon = models.CharField(
        max_length=10,
        help_text="Emoji icon for this event type (e.g., 🎵, 🏢, 💝)"
    )
    features = models.JSONField(
        default=list,
        help_text="List of features for this event type"
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Show this event type publicly"
    )
    display_order = models.IntegerField(
        default=0,
        help_text="Order in which to display (lower numbers first)"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['display_order', 'title']
    
    def __str__(self):
        return self.title


class VenueSpace(models.Model):
    """Model for different venue spaces available for events"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200, help_text="Venue space name")
    description = models.TextField(help_text="Description of the venue space")
    capacity = models.CharField(
        max_length=100,
        help_text="Capacity description (e.g., 'Up to 80 guests')"
    )
    max_capacity_number = models.IntegerField(
        help_text="Maximum number of guests (for filtering/booking)"
    )
    image = models.ImageField(upload_to=venue_image_path, help_text="Venue space image")
    features = models.JSONField(
        default=list,
        help_text="List of features for this venue space"
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Show this venue space publicly"
    )
    display_order = models.IntegerField(
        default=0,
        help_text="Order in which to display (lower numbers first)"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['display_order', 'name']
    
    def __str__(self):
        return f"{self.name} - {self.capacity}"
    
    def delete(self, *args, **kwargs):
        # Delete the image file when the model instance is deleted
        if self.image:
            self.image.delete(save=False)
        super().delete(*args, **kwargs)


class RestaurantSettings(models.Model):
    """Singleton model for restaurant settings"""
    max_capacity = models.IntegerField(default=100)
    opening_time = models.TimeField(default="17:00")
    closing_time = models.TimeField(default="23:00")
    reservation_duration_minutes = models.IntegerField(default=120)
    min_party_size = models.IntegerField(default=1)
    max_party_size = models.IntegerField(default=20)
    advance_booking_days = models.IntegerField(default=90)
    cancellation_hours = models.IntegerField(default=2)
    
    class Meta:
        verbose_name = "Restaurant Settings"
        verbose_name_plural = "Restaurant Settings"
    
    def save(self, *args, **kwargs):
        # Ensure only one instance exists
        self.pk = 1
        super().save(*args, **kwargs)
    
    @classmethod
    def get_settings(cls):
        obj, created = cls.objects.get_or_create(pk=1)
        return obj