# server/api/admin.py
from django.contrib import admin
from .models import (
    # Existing models
    Reservation, ContactMessage, GalleryItem, Event, EventType, VenueSpace,
    MenuCategory, MenuItem, MenuItemVariant, RestaurantSettings,
    # Phase 4 models
    FloorPlan, Table, TableAssignment, CustomerProfile, VIPMembership,
    Offer, Waitlist, SMSNotification, OTPVerification, ProcessedImage
)


# ============ EXISTING MODEL ADMINS ============

@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'email', 'phone', 'date', 'time', 'party_size', 'status', 'created_at']
    list_filter = ['status', 'date', 'occasion']
    search_fields = ['first_name', 'last_name', 'email', 'phone']
    ordering = ['-date', '-time']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ('Guest Information', {
            'fields': ('first_name', 'last_name', 'email', 'phone')
        }),
        ('Reservation Details', {
            'fields': ('date', 'time', 'party_size', 'occasion', 'status')
        }),
        ('Special Requirements', {
            'fields': ('special_requests', 'dietary_restrictions')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'subject', 'is_read', 'is_replied', 'created_at']
    list_filter = ['subject', 'is_read', 'is_replied', 'event_type']
    search_fields = ['name', 'email', 'message']
    ordering = ['-created_at']
    readonly_fields = ['created_at']


@admin.register(GalleryItem)
class GalleryItemAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'is_featured', 'is_active', 'display_order', 'created_at']
    list_filter = ['category', 'is_featured', 'is_active']
    search_fields = ['title', 'description']
    ordering = ['display_order', '-created_at']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ['title', 'event_type', 'start_date', 'start_time', 'status', 'is_featured', 'is_active']
    list_filter = ['event_type', 'status', 'is_featured', 'is_active', 'recurring_type']
    search_fields = ['title', 'description']
    ordering = ['display_order', '-start_date', 'start_time']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'description', 'image', 'event_type', 'status')
        }),
        ('Date & Time', {
            'fields': ('start_date', 'end_date', 'start_time', 'end_time')
        }),
        ('Recurring Event Settings', {
            'fields': ('recurring_type', 'recurring_days', 'recurring_until', 'frequency', 'recurring_day'),
            'classes': ('collapse',)
        }),
        ('Pricing & Capacity', {
            'fields': ('price', 'formatted_price', 'price_display', 'capacity', 'max_capacity')
        }),
        ('Booking & Location', {
            'fields': ('location', 'booking_required', 'booking_url')
        }),
        ('Display Settings', {
            'fields': ('is_featured', 'is_active', 'display_order')
        }),
        ('Additional Information', {
            'fields': ('special_notes', 'special_instructions')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(EventType)
class EventTypeAdmin(admin.ModelAdmin):
    list_display = ['title', 'icon', 'is_active', 'display_order']
    list_filter = ['is_active']
    search_fields = ['title', 'description']
    ordering = ['display_order', 'title']


@admin.register(VenueSpace)
class VenueSpaceAdmin(admin.ModelAdmin):
    list_display = ['name', 'capacity', 'max_capacity_number', 'is_active', 'display_order']
    list_filter = ['is_active']
    search_fields = ['name', 'description']
    ordering = ['display_order', 'name']


@admin.register(MenuCategory)
class MenuCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'category_type', 'icon', 'is_active', 'display_order']
    list_filter = ['category_type', 'is_active']
    search_fields = ['name', 'description']
    ordering = ['display_order', 'name']


@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'price', 'is_available', 'is_featured', 'display_order']
    list_filter = ['category', 'is_available', 'is_featured', 'has_variants']
    search_fields = ['name', 'description', 'ingredients']
    ordering = ['category__display_order', 'display_order', 'name']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(MenuItemVariant)
class MenuItemVariantAdmin(admin.ModelAdmin):
    list_display = ['menu_item', 'name', 'price', 'variant_type', 'is_available', 'display_order']
    list_filter = ['variant_type', 'is_available']
    search_fields = ['name', 'description', 'menu_item__name']
    ordering = ['menu_item', 'display_order', 'price']


@admin.register(RestaurantSettings)
class RestaurantSettingsAdmin(admin.ModelAdmin):
    list_display = ['max_capacity', 'opening_time', 'closing_time', 'reservation_duration_minutes']

    def has_add_permission(self, request):
        # Only allow one settings instance
        return not RestaurantSettings.objects.exists()

    def has_delete_permission(self, request, obj=None):
        # Prevent deletion of settings
        return False


# ============ PHASE 4 MODEL ADMINS ============

@admin.register(FloorPlan)
class FloorPlanAdmin(admin.ModelAdmin):
    list_display = ['name', 'is_active', 'display_order', 'created_at']
    list_filter = ['is_active']
    search_fields = ['name', 'description']
    ordering = ['display_order', 'name']
    readonly_fields = ['created_at']


@admin.register(Table)
class TableAdmin(admin.ModelAdmin):
    list_display = ['table_number', 'floor_plan', 'capacity', 'shape', 'is_vip', 'is_available']
    list_filter = ['floor_plan', 'shape', 'is_vip', 'is_available']
    search_fields = ['table_number', 'notes']
    ordering = ['floor_plan', 'table_number']
    readonly_fields = ['created_at']
    fieldsets = (
        ('Basic Information', {
            'fields': ('floor_plan', 'table_number', 'capacity', 'min_capacity', 'shape')
        }),
        ('Position', {
            'fields': ('position_x', 'position_y'),
            'classes': ('collapse',)
        }),
        ('Status & Features', {
            'fields': ('is_available', 'is_vip', 'notes')
        }),
        ('Metadata', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )


@admin.register(TableAssignment)
class TableAssignmentAdmin(admin.ModelAdmin):
    list_display = ['reservation', 'table', 'assigned_at']
    list_filter = ['assigned_at', 'table__floor_plan']
    search_fields = ['reservation__first_name', 'reservation__last_name', 'table__table_number']
    ordering = ['-assigned_at']
    readonly_fields = ['assigned_at']


@admin.register(CustomerProfile)
class CustomerProfileAdmin(admin.ModelAdmin):
    list_display = ['email', 'phone', 'first_name', 'last_name', 'tier', 'points', 'lifetime_visits', 'is_vip']
    list_filter = ['tier', 'is_vip', 'is_blacklisted']
    search_fields = ['email', 'phone', 'first_name', 'last_name']
    ordering = ['-lifetime_spent', '-lifetime_visits']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ('Contact Information', {
            'fields': ('email', 'phone', 'first_name', 'last_name')
        }),
        ('Loyalty', {
            'fields': ('tier', 'points', 'lifetime_visits', 'lifetime_spent')
        }),
        ('Preferences', {
            'fields': ('favorite_table', 'dietary_preferences', 'special_occasions')
        }),
        ('Communication', {
            'fields': ('sms_notifications', 'email_notifications')
        }),
        ('Status', {
            'fields': ('is_vip', 'is_blacklisted')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(VIPMembership)
class VIPMembershipAdmin(admin.ModelAdmin):
    list_display = ['membership_number', 'customer', 'status', 'start_date', 'end_date']
    list_filter = ['status']
    search_fields = ['membership_number', 'customer__email', 'customer__first_name', 'customer__last_name']
    ordering = ['-start_date']


@admin.register(Offer)
class OfferAdmin(admin.ModelAdmin):
    list_display = ['title', 'offer_type', 'promo_code', 'start_date', 'end_date', 'is_active', 'current_uses']
    list_filter = ['offer_type', 'is_active']
    search_fields = ['title', 'description', 'promo_code']
    ordering = ['-start_date']
    readonly_fields = ['current_uses']


@admin.register(Waitlist)
class WaitlistAdmin(admin.ModelAdmin):
    list_display = ['name', 'phone', 'party_size', 'status', 'position', 'estimated_wait_minutes', 'created_at']
    list_filter = ['status']
    search_fields = ['name', 'phone']
    ordering = ['position', 'created_at']
    readonly_fields = ['created_at']


@admin.register(SMSNotification)
class SMSNotificationAdmin(admin.ModelAdmin):
    list_display = ['recipient_phone', 'notification_type', 'status', 'sent_at', 'created_at']
    list_filter = ['notification_type', 'status']
    search_fields = ['recipient_phone', 'message', 'twilio_sid']
    ordering = ['-created_at']
    readonly_fields = ['sent_at', 'created_at']
    fieldsets = (
        ('Message Information', {
            'fields': ('recipient_phone', 'message', 'notification_type')
        }),
        ('Status', {
            'fields': ('status', 'twilio_sid', 'error_message')
        }),
        ('Related Data', {
            'fields': ('reservation',)
        }),
        ('Metadata', {
            'fields': ('sent_at', 'created_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(OTPVerification)
class OTPVerificationAdmin(admin.ModelAdmin):
    list_display = ['phone', 'otp_code', 'is_verified', 'attempts', 'expires_at', 'created_at']
    list_filter = ['is_verified']
    search_fields = ['phone', 'otp_code']
    ordering = ['-created_at']
    readonly_fields = ['created_at']


@admin.register(ProcessedImage)
class ProcessedImageAdmin(admin.ModelAdmin):
    list_display = ['source_type', 'source_id', 'format', 'size', 'width', 'height', 'file_size', 'created_at']
    list_filter = ['source_type', 'format', 'size']
    search_fields = ['source_type', 'source_id']
    ordering = ['-created_at']
    readonly_fields = ['created_at']
