# server/api/models.py - UPDATED WITH FRONTEND COMPATIBILITY
from django.db import models
from django.contrib.contenttypes.fields import GenericForeignKey, GenericRelation
from django.contrib.contenttypes.models import ContentType
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
import uuid
import os


# =============================================================================
# TRANSLATION INFRASTRUCTURE
# =============================================================================

class Translation(models.Model):
    """Generic translation model for storing localized content"""
    LOCALE_CHOICES = [
        ('sq', 'Albanian'),
        ('en', 'English'),
    ]

    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('pending', 'Pending Review'),
        ('approved', 'Approved'),
        ('published', 'Published'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # Generic foreign key to any translatable model
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.UUIDField()
    content_object = GenericForeignKey('content_type', 'object_id')

    # Translation fields
    locale = models.CharField(max_length=5, choices=LOCALE_CHOICES)
    field_name = models.CharField(max_length=100, help_text="Name of the translated field")
    translated_text = models.TextField(help_text="Translated content")

    # Translation status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    is_auto_translated = models.BooleanField(default=False)

    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    translated_by = models.CharField(max_length=200, blank=True, help_text="Who created this translation")

    class Meta:
        ordering = ['locale', 'field_name']
        unique_together = ['content_type', 'object_id', 'locale', 'field_name']
        indexes = [
            models.Index(fields=['content_type', 'object_id', 'locale']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f"{self.content_type.model}:{self.field_name} ({self.locale})"


class TranslatableMixin(models.Model):
    """Abstract mixin for models that support translations"""
    translations = GenericRelation(Translation)

    # Publication status
    is_published = models.BooleanField(default=False, help_text="Published to public site")
    published_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        abstract = True

    def get_translation(self, field_name, locale='sq'):
        """Get translated value for a field in a specific locale"""
        if locale == 'sq':
            # Return original field value for default locale
            return getattr(self, field_name, '')

        translation = self.translations.filter(
            field_name=field_name,
            locale=locale,
            status='published'
        ).first()

        if translation:
            return translation.translated_text

        # Fallback to original field value
        return getattr(self, field_name, '')

    def get_all_translations(self, locale='sq'):
        """Get all translations for a specific locale as a dictionary"""
        translations_dict = {}
        for translation in self.translations.filter(locale=locale, status='published'):
            translations_dict[translation.field_name] = translation.translated_text
        return translations_dict

    def has_translation(self, locale):
        """Check if this object has translations for a locale"""
        return self.translations.filter(locale=locale, status='published').exists()

    def translation_status(self, locale):
        """Get translation status for a locale"""
        translations = self.translations.filter(locale=locale)
        if not translations.exists():
            return 'missing'
        if translations.filter(status='published').count() == translations.count():
            return 'complete'
        return 'partial'


# =============================================================================
# HOME SECTION MODEL
# =============================================================================

def home_section_image_path(instance, filename):
    """Generate file path for home section images"""
    ext = filename.split('.')[-1]
    filename = f"{uuid.uuid4().hex}.{ext}"
    return os.path.join('home_sections', filename)


class HomeSection(TranslatableMixin):
    """Model for managing homepage sections"""
    SECTION_TYPE_CHOICES = [
        ('hero', 'Hero Section'),
        ('story', 'Our Story'),
        ('signature_picks', 'Signature Picks'),
        ('tonights_vibe', "Tonight's Vibe"),
        ('upcoming_events', 'Upcoming Events'),
        ('gallery_preview', 'Gallery Preview'),
        ('reviews', 'Reviews Carousel'),
        ('visit', 'Visit Section'),
        ('location', 'Location Section'),
        ('final_cta', 'Final CTA'),
        ('custom', 'Custom Section'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    section_type = models.CharField(
        max_length=30,
        choices=SECTION_TYPE_CHOICES,
        unique=True,
        help_text="Type of homepage section"
    )

    # Content fields (Albanian - default)
    title = models.CharField(max_length=200, help_text="Section title")
    subtitle = models.CharField(max_length=300, blank=True, help_text="Section subtitle")
    description = models.TextField(blank=True, help_text="Section description/content")

    # Additional content fields
    button_text = models.CharField(max_length=100, blank=True, help_text="CTA button text")
    button_url = models.CharField(max_length=300, blank=True, help_text="CTA button URL")
    secondary_button_text = models.CharField(max_length=100, blank=True)
    secondary_button_url = models.CharField(max_length=300, blank=True)

    # Media
    image = models.ImageField(upload_to=home_section_image_path, blank=True, null=True)
    background_image = models.ImageField(upload_to=home_section_image_path, blank=True, null=True)
    video_url = models.URLField(blank=True, null=True, help_text="YouTube or Vimeo URL")

    # Additional data (for flexible content)
    extra_data = models.JSONField(default=dict, blank=True, help_text="Additional section data")

    # Display settings
    is_active = models.BooleanField(default=True, help_text="Show this section")
    display_order = models.IntegerField(default=0, help_text="Order on page")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['display_order']
        verbose_name = 'Home Section'
        verbose_name_plural = 'Home Sections'

    def __str__(self):
        return f"{self.get_section_type_display()}"

    def get_localized_data(self, locale='sq'):
        """Get all localized content for this section"""
        data = {
            'id': str(self.id),
            'section_type': self.section_type,
            'title': self.get_translation('title', locale) or self.title,
            'subtitle': self.get_translation('subtitle', locale) or self.subtitle,
            'description': self.get_translation('description', locale) or self.description,
            'button_text': self.get_translation('button_text', locale) or self.button_text,
            'button_url': self.button_url,
            'secondary_button_text': self.get_translation('secondary_button_text', locale) or self.secondary_button_text,
            'secondary_button_url': self.secondary_button_url,
            'image': self.image.url if self.image else None,
            'background_image': self.background_image.url if self.background_image else None,
            'video_url': self.video_url,
            'extra_data': self.extra_data,
            'display_order': self.display_order,
        }
        return data


# =============================================================================
# STATIC CONTENT MODEL (for page-level content)
# =============================================================================

class StaticContent(TranslatableMixin):
    """Model for managing static page content"""
    PAGE_CHOICES = [
        ('contact', 'Contact Page'),
        ('about', 'About Page'),
        ('reservations', 'Reservations Page'),
        ('events', 'Events Page'),
        ('menu', 'Menu Page'),
        ('gallery', 'Gallery Page'),
        ('privacy', 'Privacy Policy'),
        ('terms', 'Terms of Service'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    page = models.CharField(max_length=50, choices=PAGE_CHOICES, unique=True)

    # Content (Albanian - default)
    page_title = models.CharField(max_length=200)
    page_subtitle = models.CharField(max_length=300, blank=True)
    hero_title = models.CharField(max_length=200, blank=True)
    hero_description = models.TextField(blank=True)
    content = models.TextField(blank=True, help_text="Main page content (Markdown supported)")

    # SEO
    meta_title = models.CharField(max_length=200, blank=True)
    meta_description = models.CharField(max_length=500, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Static Content'
        verbose_name_plural = 'Static Content'

    def __str__(self):
        return f"{self.get_page_display()}"


# =============================================================================
# RESTAURANT INFORMATION MODEL
# =============================================================================

class RestaurantInfo(TranslatableMixin):
    """Singleton model for restaurant information"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # Basic info
    name = models.CharField(max_length=200, default="Bottle Brothers")
    tagline = models.CharField(max_length=300, blank=True)
    description = models.TextField(blank=True)

    # Contact
    phone = models.CharField(max_length=30)
    email = models.EmailField()

    # Address (Albanian - default)
    address_line1 = models.CharField(max_length=200)
    address_line2 = models.CharField(max_length=200, blank=True)
    city = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20, blank=True)
    country = models.CharField(max_length=100, default="Albania")

    # Coordinates
    latitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    longitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)

    # Hours (stored as JSON for flexibility)
    opening_hours = models.JSONField(default=dict, blank=True)

    # Social links
    instagram = models.URLField(blank=True)
    facebook = models.URLField(blank=True)
    tiktok = models.URLField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Restaurant Info'
        verbose_name_plural = 'Restaurant Info'

    def save(self, *args, **kwargs):
        # Ensure only one instance exists
        self.pk = uuid.UUID('00000000-0000-0000-0000-000000000001')
        super().save(*args, **kwargs)

    @classmethod
    def get_info(cls):
        obj, created = cls.objects.get_or_create(
            pk=uuid.UUID('00000000-0000-0000-0000-000000000001'),
            defaults={
                'name': 'Bottle Brothers',
                'phone': '+355 69 123 4567',
                'email': 'info@bottlebrothers.al',
                'address_line1': 'Rruga e Dibres',
                'city': 'Tirana',
                'country': 'Albania',
            }
        )
        return obj

    def __str__(self):
        return self.name


# =============================================================================
# EXISTING MODELS - Add TranslatableMixin
# =============================================================================

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

    # Guest reservation fields
    verification_code = models.CharField(
        max_length=10,
        unique=True,
        blank=True,
        null=True,
        help_text="Public code for reservation lookup"
    )
    email_verified = models.BooleanField(default=False)
    email_otp_code = models.CharField(max_length=6, blank=True, null=True)
    email_otp_expires_at = models.DateTimeField(blank=True, null=True)
    email_otp_attempts = models.IntegerField(default=0)
    preferred_locale = models.CharField(max_length=5, default='sq')
    user = models.ForeignKey(
        'auth.User',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='reservations',
        help_text="Optional link to user account"
    )

    class Meta:
        ordering = ['-date', '-time']
        indexes = [
            models.Index(fields=['email', 'phone']),
            models.Index(fields=['date', 'time']),
            models.Index(fields=['status']),
            models.Index(fields=['verification_code']),
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

    def generate_verification_code(self):
        """Generate a unique verification code for reservation lookup"""
        import random
        import string
        chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'  # Excluding confusing chars
        while True:
            code = ''.join(random.choices(chars, k=8))
            if not Reservation.objects.filter(verification_code=code).exists():
                self.verification_code = code
                return code

    def generate_email_otp(self):
        """Generate a 6-digit OTP for email verification"""
        import random
        from datetime import timedelta
        self.email_otp_code = ''.join(random.choices('0123456789', k=6))
        self.email_otp_expires_at = timezone.now() + timedelta(minutes=15)
        self.email_otp_attempts = 0
        return self.email_otp_code

    def verify_email_otp(self, otp_code):
        """Verify the OTP code"""
        if self.email_otp_attempts >= 5:
            return False, 'Too many attempts. Please request a new code.'

        self.email_otp_attempts += 1
        self.save(update_fields=['email_otp_attempts'])

        if not self.email_otp_code or not self.email_otp_expires_at:
            return False, 'No OTP code found. Please request a new code.'

        if timezone.now() > self.email_otp_expires_at:
            return False, 'OTP code has expired. Please request a new code.'

        if self.email_otp_code != otp_code:
            return False, 'Invalid OTP code.'

        # Success - mark as verified
        self.email_verified = True
        self.email_otp_code = None
        self.email_otp_expires_at = None
        self.save(update_fields=['email_verified', 'email_otp_code', 'email_otp_expires_at'])
        return True, 'Email verified successfully.'

    def save(self, *args, **kwargs):
        # Generate verification code if not set
        if not self.verification_code:
            self.generate_verification_code()
        # Auto-confirm reservations when email is verified
        if self.status == 'pending' and self.email_verified:
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


class GalleryItem(TranslatableMixin):
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

# Add these models to your existing server/api/models.py file

def menu_image_path(instance, filename):
    """Generate file path for menu item images"""
    ext = filename.split('.')[-1]
    filename = f"{uuid.uuid4().hex}.{ext}"
    return os.path.join('menu', filename)

class MenuCategory(TranslatableMixin):
    """Model for menu categories with subcategory support"""
    CATEGORY_CHOICES = [
        ('cocktails', 'Cocktails'),
        ('wine', 'Wine'),
        ('beer', 'Beer'),
        ('food', 'Food'),
        ('shisha', 'Shisha'),
        ('appetizers', 'Appetizers'),
        ('mains', 'Main Courses'),
        ('desserts', 'Desserts'),
        ('beverages', 'Beverages'),
        ('specials', 'Chef\'s Specials'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, help_text="Category name")
    category_type = models.CharField(
        max_length=20,
        choices=CATEGORY_CHOICES,
        blank=True,
        help_text="Category type (for main categories)"
    )
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='subcategories',
        help_text="Parent category (null for main categories)"
    )
    description = models.TextField(blank=True, help_text="Category description")
    icon = models.CharField(
        max_length=10,
        blank=True,
        help_text="Emoji icon for category (e.g., 🥗, 🍖, 🍸)"
    )
    display_order = models.IntegerField(
        default=0,
        help_text="Order in which to display (lower numbers first)"
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Show this category on the menu"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['display_order', 'name']
        verbose_name = 'Menu Category'
        verbose_name_plural = 'Menu Categories'

    def __str__(self):
        if self.parent:
            return f"{self.parent.name} > {self.name}"
        return self.name

    @property
    def is_subcategory(self):
        """Check if this is a subcategory"""
        return self.parent is not None

    @property
    def subcategory_count(self):
        """Get count of subcategories"""
        return self.subcategories.filter(is_active=True).count()

    @property
    def items_count(self):
        """Get count of active items in this category"""
        return self.menu_items.filter(is_available=True).count()


class MenuItem(TranslatableMixin):
    """Model for menu items"""
    DIETARY_CHOICES = [
        ('vegetarian', 'Vegetarian'),
        ('vegan', 'Vegan'),
        ('gluten_free', 'Gluten Free'),
        ('dairy_free', 'Dairy Free'),
        ('nut_free', 'Nut Free'),
        ('keto', 'Keto Friendly'),
        ('paleo', 'Paleo'),
        ('halal', 'Halal'),
        ('kosher', 'Kosher'),
    ]
    
    TAG_CHOICES = [
        ('signature', 'Chef\'s Signature'),
        ('popular', 'Popular Choice'),
        ('new', 'New Item'),
        ('seasonal', 'Seasonal'),
        ('spicy', 'Spicy'),
        ('house_made', 'House Made'),
        ('locally_sourced', 'Locally Sourced'),
        ('organic', 'Organic'),
        ('sustainable', 'Sustainably Sourced'),
        ('premium', 'Premium'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    category = models.ForeignKey(
        MenuCategory,
        on_delete=models.CASCADE,
        related_name='menu_items',
        help_text="Menu category"
    )
    name = models.CharField(max_length=200, help_text="Item name")
    description = models.TextField(help_text="Item description")
    price = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        help_text="Item price"
    )
    image = models.ImageField(
        upload_to=menu_image_path,
        blank=True,
        null=True,
        help_text="Item image (optional)"
    )
    
    # Dietary restrictions and tags
    dietary_info = models.JSONField(
        default=list,
        blank=True,
        help_text="List of dietary restrictions/info (e.g., ['vegetarian', 'gluten_free'])"
    )
    tags = models.JSONField(
        default=list,
        blank=True,
        help_text="List of tags (e.g., ['signature', 'popular'])"
    )
    
    # Additional details
    ingredients = models.TextField(
        blank=True,
        help_text="Main ingredients (optional)"
    )
    allergens = models.TextField(
        blank=True,
        help_text="Allergen information (optional)"
    )
    calories = models.IntegerField(
        blank=True,
        null=True,
        help_text="Calorie count (optional)"
    )
    preparation_time = models.CharField(
        max_length=50,
        blank=True,
        help_text="Preparation time (e.g., '15 minutes', optional)"
    )
    
    # Display settings
    is_available = models.BooleanField(
        default=True,
        help_text="Item is currently available"
    )
    is_featured = models.BooleanField(
        default=False,
        help_text="Feature this item prominently"
    )
    display_order = models.IntegerField(
        default=0,
        help_text="Order within category (lower numbers first)"
    )
    
    # Pricing options for drinks/wine
    has_variants = models.BooleanField(
        default=False,
        help_text="Item has size/variant options (e.g., glass vs bottle)"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['category__display_order', 'display_order', 'name']
        indexes = [
            models.Index(fields=['category', 'is_available']),
            models.Index(fields=['is_featured', 'is_available']),
            models.Index(fields=['display_order']),
        ]
    
    def __str__(self):
        return f"{self.name} - {self.category.name}"
    
    @property
    def formatted_price(self):
        """Return formatted price"""
        return f"${self.price}"
    
    @property
    def image_url(self):
        """Get image URL if image exists"""
        if self.image:
            return self.image.url
        return None
    
    def delete(self, *args, **kwargs):
        # Delete the image file when the model instance is deleted
        if self.image:
            self.image.delete(save=False)
        super().delete(*args, **kwargs)


class MenuItemVariant(models.Model):
    """Model for menu item variants (e.g., glass vs bottle for wine)"""
    VARIANT_TYPE_CHOICES = [
        ('size', 'Size'),
        ('portion', 'Portion'),
        ('preparation', 'Preparation Style'),
        ('wine_format', 'Wine Format'),
        ('other', 'Other'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    menu_item = models.ForeignKey(
        MenuItem,
        on_delete=models.CASCADE,
        related_name='variants',
        help_text="Menu item this variant belongs to"
    )
    name = models.CharField(
        max_length=100,
        help_text="Variant name (e.g., 'Glass', 'Bottle', 'Small', 'Large')"
    )
    description = models.CharField(
        max_length=200,
        blank=True,
        help_text="Variant description (optional)"
    )
    price = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        help_text="Variant price"
    )
    variant_type = models.CharField(
        max_length=20,
        choices=VARIANT_TYPE_CHOICES,
        default='size',
        help_text="Type of variant"
    )
    display_order = models.IntegerField(
        default=0,
        help_text="Display order within item"
    )
    is_available = models.BooleanField(
        default=True,
        help_text="Variant is currently available"
    )
    
    class Meta:
        ordering = ['display_order', 'price']
        unique_together = ['menu_item', 'name']
    
    def __str__(self):
        return f"{self.menu_item.name} - {self.name} (${self.price})"
    
    @property
    def formatted_price(self):
        """Return formatted price"""
        return f"${self.price}"
    
class Event(TranslatableMixin):
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



class EventType(TranslatableMixin):
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


class VenueSpace(TranslatableMixin):
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


# Phase 4: Database Schema Extensions - ADD THESE TO models.py


# Add these models to the end of your models.py file

class FloorPlan(models.Model):
    """Model for restaurant floor plans"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, help_text="Floor plan name (e.g., 'Main Dining', 'Patio')")
    description = models.TextField(blank=True, help_text="Description of this floor plan")
    display_order = models.IntegerField(default=0, help_text="Display order")
    is_active = models.BooleanField(default=True, help_text="Is this floor plan active")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['display_order', 'name']

    def __str__(self):
        return self.name


class Table(models.Model):
    """Model for restaurant tables"""
    SHAPE_CHOICES = [
        ('square', 'Square'),
        ('round', 'Round'),
        ('rectangular', 'Rectangular'),
        ('booth', 'Booth'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    floor_plan = models.ForeignKey(FloorPlan, on_delete=models.CASCADE, related_name='tables')
    table_number = models.CharField(max_length=20, help_text="Table number (e.g., 'T1', 'VIP-1')")
    capacity = models.IntegerField(help_text="Maximum capacity")
    min_capacity = models.IntegerField(default=1, help_text="Minimum capacity")
    shape = models.CharField(max_length=20, choices=SHAPE_CHOICES, default='square')
    position_x = models.IntegerField(null=True, blank=True, help_text="X coordinate for visual layout")
    position_y = models.IntegerField(null=True, blank=True, help_text="Y coordinate for visual layout")
    is_available = models.BooleanField(default=True, help_text="Is table currently available")
    is_vip = models.BooleanField(default=False, help_text="Is this a VIP table")
    notes = models.TextField(blank=True, help_text="Special notes about this table")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['floor_plan', 'table_number']
        unique_together = ['floor_plan', 'table_number']

    def __str__(self):
        return f"{self.table_number} ({self.floor_plan.name})"


class TableAssignment(models.Model):
    """Model for table assignments to reservations"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    reservation = models.ForeignKey('Reservation', on_delete=models.CASCADE, related_name='table_assignments')
    table = models.ForeignKey(Table, on_delete=models.CASCADE, related_name='assignments')
    assigned_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ['-assigned_at']

    def __str__(self):
        return f"{self.table.table_number} -> {self.reservation.full_name}"


class CustomerProfile(models.Model):
    """Model for customer profiles and loyalty"""
    TIER_CHOICES = [
        ('regular', 'Regular'),
        ('silver', 'Silver'),
        ('gold', 'Gold'),
        ('platinum', 'Platinum'),
        ('vip', 'VIP'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, db_index=True)
    phone = models.CharField(max_length=20, unique=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)

    # Loyalty
    tier = models.CharField(max_length=20, choices=TIER_CHOICES, default='regular')
    points = models.IntegerField(default=0)
    lifetime_visits = models.IntegerField(default=0)
    lifetime_spent = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    # Preferences
    favorite_table = models.ForeignKey(Table, null=True, blank=True, on_delete=models.SET_NULL)
    dietary_preferences = models.TextField(blank=True)
    special_occasions = models.JSONField(default=dict, blank=True)

    # Communication
    sms_notifications = models.BooleanField(default=True)
    email_notifications = models.BooleanField(default=True)

    # Metadata
    is_vip = models.BooleanField(default=False)
    is_blacklisted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-lifetime_spent', '-lifetime_visits']

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.tier})"


class VIPMembership(models.Model):
    """Model for VIP memberships"""
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('expired', 'Expired'),
        ('suspended', 'Suspended'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    customer = models.OneToOneField(CustomerProfile, on_delete=models.CASCADE, related_name='vip_membership')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    membership_number = models.CharField(max_length=20, unique=True)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    benefits = models.JSONField(default=list, blank=True)

    class Meta:
        ordering = ['-start_date']

    def __str__(self):
        return f"VIP {self.membership_number} - {self.customer.first_name} {self.customer.last_name}"


class Offer(models.Model):
    """Model for promotional offers"""
    OFFER_TYPE_CHOICES = [
        ('discount', 'Discount'),
        ('freebie', 'Freebie'),
        ('upgrade', 'Upgrade'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    description = models.TextField()
    offer_type = models.CharField(max_length=20, choices=OFFER_TYPE_CHOICES, default='discount')
    discount_percentage = models.IntegerField(null=True, blank=True)
    promo_code = models.CharField(max_length=50, unique=True, null=True, blank=True)
    start_date = models.DateField()
    end_date = models.DateField()
    is_active = models.BooleanField(default=True)
    max_uses_total = models.IntegerField(null=True, blank=True)
    current_uses = models.IntegerField(default=0)

    class Meta:
        ordering = ['-start_date']

    def __str__(self):
        return f"{self.title} ({self.promo_code})"


class Waitlist(models.Model):
    """Model for walk-in waitlist"""
    STATUS_CHOICES = [
        ('waiting', 'Waiting'),
        ('seated', 'Seated'),
        ('cancelled', 'Cancelled'),
        ('no_show', 'No Show'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    customer = models.ForeignKey(CustomerProfile, null=True, blank=True, on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    phone = models.CharField(max_length=20)
    party_size = models.IntegerField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='waiting')
    estimated_wait_minutes = models.IntegerField()
    position = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['position', 'created_at']

    def __str__(self):
        return f"{self.name} - Party of {self.party_size} (Position {self.position})"


class SMSNotification(models.Model):
    """Model for SMS notifications"""
    NOTIFICATION_TYPE_CHOICES = [
        ('confirmation', 'Reservation Confirmation'),
        ('reminder', 'Reservation Reminder'),
        ('otp', 'OTP Verification'),
        ('marketing', 'Marketing'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('sent', 'Sent'),
        ('delivered', 'Delivered'),
        ('failed', 'Failed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    recipient_phone = models.CharField(max_length=20)
    message = models.TextField()
    notification_type = models.CharField(max_length=30, choices=NOTIFICATION_TYPE_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    twilio_sid = models.CharField(max_length=100, blank=True)
    error_message = models.TextField(blank=True)
    reservation = models.ForeignKey('Reservation', null=True, blank=True, on_delete=models.CASCADE)
    sent_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.notification_type} to {self.recipient_phone} - {self.status}"


class OTPVerification(models.Model):
    """Model for OTP verification"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    phone = models.CharField(max_length=20)
    otp_code = models.CharField(max_length=6)
    is_verified = models.BooleanField(default=False)
    expires_at = models.DateTimeField()
    attempts = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"OTP for {self.phone} - {'Verified' if self.is_verified else 'Pending'}"


class ProcessedImage(models.Model):
    """Model for processed/optimized images"""
    FORMAT_CHOICES = [
        ('webp', 'WebP'),
        ('avif', 'AVIF'),
        ('jpeg', 'JPEG'),
    ]

    SIZE_CHOICES = [
        ('thumbnail', 'Thumbnail'),
        ('small', 'Small'),
        ('medium', 'Medium'),
        ('large', 'Large'),
        ('xlarge', 'XLarge'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    source_type = models.CharField(max_length=50, help_text="Source model type (e.g., 'menu_item', 'gallery_item')")
    source_id = models.UUIDField(help_text="Source model UUID")
    image = models.ImageField(upload_to='processed/')
    format = models.CharField(max_length=10, choices=FORMAT_CHOICES)
    size = models.CharField(max_length=20, choices=SIZE_CHOICES)
    width = models.IntegerField()
    height = models.IntegerField()
    file_size = models.IntegerField(help_text="File size in bytes")
    blur_hash = models.CharField(max_length=100, blank=True)
    lqip_data_url = models.TextField(blank=True, help_text="Low Quality Image Placeholder (base64)")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['source_type', 'source_id']),
        ]

    def __str__(self):
        return f"{self.source_type} {self.format} {self.size}"

    def delete(self, *args, **kwargs):
        if self.image:
            self.image.delete(save=False)
        super().delete(*args, **kwargs)


# =============================================================================
# USER PROFILE MODEL (for Client Portal)
# =============================================================================

class UserProfile(models.Model):
    """Extended user profile for client portal"""
    LOCALE_CHOICES = [
        ('sq', 'Albanian'),
        ('en', 'English'),
    ]

    user = models.OneToOneField(
        'auth.User',
        on_delete=models.CASCADE,
        related_name='profile'
    )
    phone = models.CharField(max_length=20, blank=True)
    preferred_locale = models.CharField(
        max_length=5,
        choices=LOCALE_CHOICES,
        default='sq'
    )
    marketing_opt_in = models.BooleanField(
        default=False,
        help_text="User consents to marketing emails"
    )

    # Link to customer profile (for loyalty)
    customer_profile = models.OneToOneField(
        CustomerProfile,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='user_profile'
    )

    # Account settings
    email_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'User Profile'
        verbose_name_plural = 'User Profiles'

    def __str__(self):
        return f"Profile: {self.user.username}"

    @property
    def full_name(self):
        return f"{self.user.first_name} {self.user.last_name}".strip() or self.user.username

    @property
    def vip_tier(self):
        """Get VIP tier from customer profile if linked"""
        if self.customer_profile:
            return self.customer_profile.tier
        return None

    @property
    def loyalty_points(self):
        """Get loyalty points from customer profile if linked"""
        if self.customer_profile:
            return self.customer_profile.points
        return 0

    def get_reservations(self):
        """Get all reservations for this user"""
        return Reservation.objects.filter(user=self.user).order_by('-date', '-time')

    def get_upcoming_reservations(self):
        """Get upcoming reservations for this user"""
        from django.utils import timezone
        return self.get_reservations().filter(
            date__gte=timezone.now().date(),
            status__in=['pending', 'confirmed']
        )

    def get_past_reservations(self):
        """Get past reservations for this user"""
        from django.utils import timezone
        return self.get_reservations().filter(
            date__lt=timezone.now().date()
        ) | self.get_reservations().filter(
            status__in=['completed', 'cancelled', 'no_show']
        )


# =============================================================================
# CLIENT MESSAGING MODELS
# =============================================================================

class ClientConversation(models.Model):
    """Model for client-admin messaging conversations"""
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('closed', 'Closed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        'auth.User',
        on_delete=models.CASCADE,
        related_name='conversations',
        help_text="Client user who started the conversation"
    )
    subject = models.CharField(max_length=200, help_text="Conversation subject")
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='open'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']
        verbose_name = 'Client Conversation'
        verbose_name_plural = 'Client Conversations'

    def __str__(self):
        return f"{self.user.email} - {self.subject}"

    @property
    def unread_count(self):
        """Count unread messages for client"""
        return self.messages.filter(sender_type='admin', is_read=False).count()

    @property
    def last_message(self):
        """Get the last message in conversation"""
        return self.messages.order_by('-created_at').first()


class ClientMessage(models.Model):
    """Model for individual messages in a conversation"""
    SENDER_TYPE_CHOICES = [
        ('client', 'Client'),
        ('admin', 'Admin'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    conversation = models.ForeignKey(
        ClientConversation,
        on_delete=models.CASCADE,
        related_name='messages'
    )
    content = models.TextField(help_text="Message content")
    sender_type = models.CharField(
        max_length=10,
        choices=SENDER_TYPE_CHOICES
    )
    sender_name = models.CharField(max_length=200, help_text="Name of sender")
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']
        verbose_name = 'Client Message'
        verbose_name_plural = 'Client Messages'

    def __str__(self):
        return f"{self.sender_type}: {self.content[:50]}..."
