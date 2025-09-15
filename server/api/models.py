# server/api/models.py
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
import uuid

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
    