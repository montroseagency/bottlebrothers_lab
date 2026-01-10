# Generated migration for adding video fields to Event model

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0011_add_moment_model'),
    ]

    operations = [
        migrations.AddField(
            model_name='event',
            name='video_original',
            field=models.FileField(
                blank=True,
                help_text='Original uploaded video (MP4)',
                null=True,
                upload_to='events/videos/original/'
            ),
        ),
        migrations.AddField(
            model_name='event',
            name='video_webm',
            field=models.FileField(
                blank=True,
                help_text='Converted WebM video',
                null=True,
                upload_to='events/videos/webm/'
            ),
        ),
        migrations.AddField(
            model_name='event',
            name='video_status',
            field=models.CharField(
                choices=[
                    ('none', 'No Video'),
                    ('uploading', 'Uploading'),
                    ('processing', 'Processing'),
                    ('completed', 'Completed'),
                    ('failed', 'Failed')
                ],
                default='none',
                help_text='Video conversion status',
                max_length=20
            ),
        ),
        migrations.AddField(
            model_name='event',
            name='video_task_id',
            field=models.CharField(
                blank=True,
                help_text='Celery task ID for video conversion',
                max_length=255,
                null=True
            ),
        ),
        migrations.AddField(
            model_name='event',
            name='video_duration',
            field=models.FloatField(
                blank=True,
                help_text='Video duration in seconds',
                null=True
            ),
        ),
        migrations.AddField(
            model_name='event',
            name='video_error',
            field=models.TextField(
                blank=True,
                help_text='Error message if video conversion failed',
                null=True
            ),
        ),
    ]
