# Add this import to server/api/admin.py (after existing imports)
from .models import Event

# Add this admin class after the existing admin classes

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = [
        'image_thumbnail', 'title', 'event_type_badge', 'status_badge',
        'start_date', 'start_time', 'formatted_price', 'is_featured', 
        'is_active', 'display_order'
    ]
    list_filter = [
        'event_type', 'status', 'is_featured', 'is_active', 
        'booking_required', 'start_date', 'created_at'
    ]
    search_fields = ['title', 'description', 'location']
    readonly_fields = ['id', 'created_at', 'updated_at', 'is_past_event', 'image_preview']
    ordering = ['display_order', 'start_date', 'start_time']
    list_editable = ['display_order', 'is_featured', 'is_active', 'status']
    date_hierarchy = 'start_date'
    
    fieldsets = (
        ('Event Information', {
            'fields': ('title', 'description', 'image', 'image_preview', 'location')
        }),
        ('Event Type & Status', {
            'fields': ('event_type', 'status', 'is_featured')
        }),
        ('Date & Time', {
            'fields': (
                ('start_date', 'end_date'),
                ('start_time', 'end_time')
            )
        }),
        ('Recurring Settings', {
            'fields': ('recurring_type', 'recurring_days', 'recurring_until'),
            'classes': ('collapse',),
            'description': 'Configure recurring events (e.g., weekly jazz nights)'
        }),
        ('Booking & Pricing', {
            'fields': ('price', 'capacity', 'booking_required', 'booking_url')
        }),
        ('Display Settings', {
            'fields': ('display_order', 'is_active', 'special_instructions')
        }),
        ('System Information', {
            'fields': ('id', 'created_at', 'updated_at', 'is_past_event'),
            'classes': ('collapse',)
        }),
    )
    
    actions = [
        'mark_as_featured', 'unmark_as_featured', 'activate_events', 
        'deactivate_events', 'mark_as_upcoming', 'mark_as_completed'
    ]
    
    def image_thumbnail(self, obj):
        if obj.image:
            return mark_safe(
                f'<img src="{obj.image.url}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;" />'
            )
        return "No Image"
    image_thumbnail.short_description = 'Image'
    
    def image_preview(self, obj):
        if obj.image:
            return mark_safe(
                f'<img src="{obj.image.url}" style="max-width: 300px; max-height: 200px; object-fit: contain;" />'
            )
        return "No image uploaded"
    image_preview.short_description = 'Image Preview'
    
    def event_type_badge(self, obj):
        colors = {
            'featured': '#dc3545',
            'regular': '#28a745',
            'recurring': '#17a2b8',
            'special': '#ffc107',
            'seasonal': '#6f42c1',
        }
        return format_html(
            '<span style="background-color: {}; color: white; padding: 2px 8px; '
            'border-radius: 3px; font-size: 11px; font-weight: bold;">{}</span>',
            colors.get(obj.event_type, '#6c757d'),
            obj.get_event_type_display()
        )
    event_type_badge.short_description = 'Type'
    
    def status_badge(self, obj):
        colors = {
            'upcoming': '#28a745',
            'ongoing': '#17a2b8',
            'completed': '#6c757d',
            'cancelled': '#dc3545',
        }
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; '
            'border-radius: 3px; font-weight: bold;">{}</span>',
            colors.get(obj.status, '#6c757d'),
            obj.get_status_display()
        )
    status_badge.short_description = 'Status'
    
    def mark_as_featured(self, request, queryset):
        updated = queryset.update(is_featured=True)
        self.message_user(request, f'{updated} event(s) marked as featured.')
    mark_as_featured.short_description = 'Mark as featured'
    
    def unmark_as_featured(self, request, queryset):
        updated = queryset.update(is_featured=False)
        self.message_user(request, f'{updated} event(s) unmarked as featured.')
    unmark_as_featured.short_description = 'Unmark as featured'
    
    def activate_events(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f'{updated} event(s) activated.')
    activate_events.short_description = 'Activate selected events'
    
    def deactivate_events(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated} event(s) deactivated.')
    deactivate_events.short_description = 'Deactivate selected events'
    
    def mark_as_upcoming(self, request, queryset):
        updated = queryset.update(status='upcoming')
        self.message_user(request, f'{updated} event(s) marked as upcoming.')
    mark_as_upcoming.short_description = 'Mark as upcoming'
    
    def mark_as_completed(self, request, queryset):
        updated = queryset.update(status='completed')
        self.message_user(request, f'{updated} event(s) marked as completed.')
    mark_as_completed.short_description = 'Mark as completed'
    
    def get_queryset(self, request):
        """Add custom annotations to queryset"""
        qs = super().get_queryset(request)
        return qs.select_related().prefetch_related()
    
    class Media:
        css = {
            'all': ('admin/css/custom_admin.css',)  # Add custom styles if needed
        }
        js = ('admin/js/event_admin.js',)  # Add custom JS if needed