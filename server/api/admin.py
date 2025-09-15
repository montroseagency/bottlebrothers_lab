# server/api/admin.py
from django.contrib import admin
from django.utils.html import format_html
from .models import Reservation, ContactMessage, RestaurantSettings


@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = [
        'full_name', 'date', 'time', 'party_size', 
        'status_badge', 'phone', 'email', 'created_at'
    ]
    list_filter = ['status', 'date', 'occasion', 'party_size']
    search_fields = ['first_name', 'last_name', 'email', 'phone']
    readonly_fields = ['id', 'created_at', 'updated_at', 'full_name', 'is_past_date']
    date_hierarchy = 'date'
    ordering = ['-date', '-time']
    
    fieldsets = (
        ('Guest Information', {
            'fields': ('first_name', 'last_name', 'email', 'phone')
        }),
        ('Reservation Details', {
            'fields': ('date', 'time', 'party_size', 'status', 'occasion')
        }),
        ('Special Requests', {
            'fields': ('special_requests', 'dietary_restrictions'),
            'classes': ('collapse',)
        }),
        ('System Information', {
            'fields': ('id', 'created_at', 'updated_at', 'is_past_date'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['confirm_reservations', 'cancel_reservations', 'mark_as_seated']
    
    def status_badge(self, obj):
        colors = {
            'pending': '#FFA500',
            'confirmed': '#28a745',
            'seated': '#17a2b8',
            'completed': '#6c757d',
            'cancelled': '#dc3545',
            'no_show': '#721c24',
        }
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; '
            'border-radius: 3px; font-weight: bold;">{}</span>',
            colors.get(obj.status, '#6c757d'),
            obj.get_status_display()
        )
    status_badge.short_description = 'Status'
    
    def confirm_reservations(self, request, queryset):
        updated = queryset.update(status='confirmed')
        self.message_user(request, f'{updated} reservation(s) confirmed.')
    confirm_reservations.short_description = 'Confirm selected reservations'
    
    def cancel_reservations(self, request, queryset):
        updated = queryset.update(status='cancelled')
        self.message_user(request, f'{updated} reservation(s) cancelled.')
    cancel_reservations.short_description = 'Cancel selected reservations'
    
    def mark_as_seated(self, request, queryset):
        updated = queryset.update(status='seated')
        self.message_user(request, f'{updated} reservation(s) marked as seated.')
    mark_as_seated.short_description = 'Mark as seated'


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'subject', 'email', 'phone', 
        'is_read', 'is_replied', 'created_at'
    ]
    list_filter = ['subject', 'is_read', 'is_replied', 'event_type', 'created_at']
    search_fields = ['name', 'email', 'phone', 'message']
    readonly_fields = ['id', 'created_at']
    date_hierarchy = 'created_at'
    ordering = ['-created_at']
    
    fieldsets = (
        ('Contact Information', {
            'fields': ('name', 'email', 'phone')
        }),
        ('Message Details', {
            'fields': ('subject', 'message')
        }),
        ('Event Information', {
            'fields': ('event_date', 'guest_count', 'event_type'),
            'classes': ('collapse',)
        }),
        ('Status', {
            'fields': ('is_read', 'is_replied')
        }),
        ('System Information', {
            'fields': ('id', 'created_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['mark_as_read', 'mark_as_unread', 'mark_as_replied']
    
    def mark_as_read(self, request, queryset):
        updated = queryset.update(is_read=True)
        self.message_user(request, f'{updated} message(s) marked as read.')
    mark_as_read.short_description = 'Mark as read'
    
    def mark_as_unread(self, request, queryset):
        updated = queryset.update(is_read=False)
        self.message_user(request, f'{updated} message(s) marked as unread.')
    mark_as_unread.short_description = 'Mark as unread'
    
    def mark_as_replied(self, request, queryset):
        updated = queryset.update(is_replied=True)
        self.message_user(request, f'{updated} message(s) marked as replied.')
    mark_as_replied.short_description = 'Mark as replied'


@admin.register(RestaurantSettings)
class RestaurantSettingsAdmin(admin.ModelAdmin):
    list_display = [
        'max_capacity', 'opening_time', 'closing_time', 
        'advance_booking_days', 'cancellation_hours'
    ]
    
    fieldsets = (
        ('Capacity Settings', {
            'fields': ('max_capacity', 'min_party_size', 'max_party_size')
        }),
        ('Operating Hours', {
            'fields': ('opening_time', 'closing_time')
        }),
        ('Booking Rules', {
            'fields': (
                'reservation_duration_minutes', 
                'advance_booking_days', 
                'cancellation_hours'
            )
        }),
    )
    
    def has_add_permission(self, request):
        # Only allow one instance
        return not RestaurantSettings.objects.exists()
    
    def has_delete_permission(self, request, obj=None):
        # Don't allow deletion
        return False