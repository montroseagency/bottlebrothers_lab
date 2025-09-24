# server/api/migrations/0002_event_updates.py
# Generated migration for Event model updates

from django.db import migrations, models
import api.models
import uuid

class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Event',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('title', models.CharField(help_text='Event title', max_length=200)),
                ('description', models.TextField(help_text='Event description')),
                ('image', models.ImageField(help_text='Event image', upload_to=api.models.event_image_path)),
                ('event_type', models.CharField(choices=[('featured', 'Featured Event'), ('regular', 'Regular Event'), ('recurring', 'Recurring Event')], default='regular', help_text='Type of event', max_length=20)),
                ('start_date', models.DateField(help_text='Event start date')),
                ('end_date', models.DateField(blank=True, help_text='Event end date (for multi-day events)', null=True)),
                ('start_time', models.TimeField(help_text='Event start time')),
                ('end_time', models.TimeField(help_text='Event end time')),
                ('frequency', models.CharField(choices=[('none', 'One Time Only'), ('daily', 'Daily'), ('weekly', 'Weekly'), ('monthly', 'Monthly')], default='none', help_text='How often this event occurs', max_length=20)),
                ('recurring_day', models.CharField(blank=True, help_text="Day of week for recurring events (e.g., 'Thursday', 'Friday & Saturday')", max_length=20, null=True)),
                ('status', models.CharField(choices=[('upcoming', 'Upcoming'), ('active', 'Active'), ('completed', 'Completed'), ('cancelled', 'Cancelled')], default='upcoming', help_text='Current status of the event', max_length=20)),
                ('price', models.DecimalField(decimal_places=2, default=0.0, help_text='Event price (0.00 for free events)', max_digits=8)),
                ('price_display', models.CharField(blank=True, help_text="Custom price display (e.g., 'No Cover', '$10 Cover', '$65 per person')", max_length=50, null=True)),
                ('max_capacity', models.IntegerField(blank=True, help_text='Maximum number of attendees', null=True)),
                ('location', models.CharField(default='Main Dining Hall', help_text='Event location', max_length=200)),
                ('booking_required', models.BooleanField(default=True, help_text='Whether booking is required for this event')),
                ('booking_url', models.URLField(blank=True, help_text='External booking URL if applicable', null=True)),
                ('is_featured', models.BooleanField(default=False, help_text='Feature this event prominently')),
                ('is_active', models.BooleanField(default=True, help_text='Show this event publicly')),
                ('display_order', models.IntegerField(default=0, help_text='Order in which to display (lower numbers first)')),
                ('special_notes', models.TextField(blank=True, help_text='Any special notes or requirements', null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'ordering': ['display_order', '-start_date', 'start_time'],
            },
        ),
        migrations.CreateModel(
            name='EventType',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('title', models.CharField(help_text='Event type title', max_length=200)),
                ('description', models.TextField(help_text='Description of this event type')),
                ('icon', models.CharField(help_text='Emoji icon for this event type (e.g., 🎵, 🏢, 💝)', max_length=10)),
                ('features', models.JSONField(default=list, help_text='List of features for this event type')),
                ('is_active', models.BooleanField(default=True, help_text='Show this event type publicly')),
                ('display_order', models.IntegerField(default=0, help_text='Order in which to display (lower numbers first)')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'ordering': ['display_order', 'title'],
            },
        ),
        migrations.CreateModel(
            name='VenueSpace',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('name', models.CharField(help_text='Venue space name', max_length=200)),
                ('description', models.TextField(help_text='Description of the venue space')),
                ('capacity', models.CharField(help_text="Capacity description (e.g., 'Up to 80 guests')", max_length=100)),
                ('max_capacity_number', models.IntegerField(help_text='Maximum number of guests (for filtering/booking)')),
                ('image', models.ImageField(help_text='Venue space image', upload_to=api.models.venue_image_path)),
                ('features', models.JSONField(default=list, help_text='List of features for this venue space')),
                ('is_active', models.BooleanField(default=True, help_text='Show this venue space publicly')),
                ('display_order', models.IntegerField(default=0, help_text='Order in which to display (lower numbers first)')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'ordering': ['display_order', 'name'],
            },
        ),
        migrations.AddIndex(
            model_name='event',
            index=models.Index(fields=['is_active', 'display_order'], name='api_event_is_acti_b43e0f_idx'),
        ),
        migrations.AddIndex(
            model_name='event',
            index=models.Index(fields=['event_type', 'is_active'], name='api_event_event_t_5b3e8c_idx'),
        ),
        migrations.AddIndex(
            model_name='event',
            index=models.Index(fields=['is_featured', 'is_active'], name='api_event_is_feat_97f42e_idx'),
        ),
        migrations.AddIndex(
            model_name='event',
            index=models.Index(fields=['start_date', 'is_active'], name='api_event_start_d_3f7d8a_idx'),
        ),
        migrations.AddIndex(
            model_name='event',
            index=models.Index(fields=['status', 'is_active'], name='api_event_status_e4b9c2_idx'),
        ),
    ]