"""
Celery tasks for async processing.
"""
import os
import logging
from celery import shared_task
from django.conf import settings

from .services.video_service import (
    convert_mp4_to_webm,
    get_video_duration,
    validate_video_file,
    cleanup_video_files,
    generate_video_filename
)

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def convert_event_video_to_webm(self, event_id):
    """
    Background task to convert an event's MP4 video to WebM format.

    Args:
        event_id: UUID of the Event to process

    Returns:
        dict: Result with status and message
    """
    from .models import Event  # Import here to avoid circular imports

    try:
        # Get the event
        event = Event.objects.get(id=event_id)

        if not event.video_original:
            event.video_status = 'failed'
            event.video_error = 'No original video file found'
            event.save(update_fields=['video_status', 'video_error'])
            return {'status': 'error', 'message': 'No original video file found'}

        # Get the original video path
        original_path = event.video_original.path

        # Validate the video file
        is_valid, error = validate_video_file(original_path)
        if not is_valid:
            event.video_status = 'failed'
            event.video_error = error
            event.save(update_fields=['video_status', 'video_error'])
            return {'status': 'error', 'message': error}

        # Update status to processing
        event.video_status = 'processing'
        event.video_error = None
        event.save(update_fields=['video_status', 'video_error'])

        # Generate output filename
        webm_filename = generate_video_filename(
            os.path.basename(original_path),
            'webm'
        )

        # Build output path
        webm_dir = os.path.join(settings.MEDIA_ROOT, 'events', 'videos', 'webm')
        os.makedirs(webm_dir, exist_ok=True)
        webm_path = os.path.join(webm_dir, webm_filename)

        # Convert video
        success, error = convert_mp4_to_webm(original_path, webm_path)

        if success:
            # Get video duration
            duration = get_video_duration(webm_path) or get_video_duration(original_path)

            # Update event with webm file
            event.video_webm.name = f'events/videos/webm/{webm_filename}'
            event.video_status = 'completed'
            event.video_duration = duration
            event.video_error = None
            event.save(update_fields=[
                'video_webm', 'video_status', 'video_duration', 'video_error'
            ])

            logger.info(f"Video conversion completed for event {event_id}")
            return {
                'status': 'success',
                'message': 'Video converted successfully',
                'webm_path': event.video_webm.url if event.video_webm else None,
                'duration': duration
            }
        else:
            # Mark as failed
            event.video_status = 'failed'
            event.video_error = error
            event.save(update_fields=['video_status', 'video_error'])

            logger.error(f"Video conversion failed for event {event_id}: {error}")
            return {'status': 'error', 'message': error}

    except Event.DoesNotExist:
        logger.error(f"Event {event_id} not found for video conversion")
        return {'status': 'error', 'message': 'Event not found'}

    except Exception as e:
        logger.exception(f"Unexpected error during video conversion for event {event_id}")

        # Try to update event status
        try:
            event = Event.objects.get(id=event_id)
            event.video_status = 'failed'
            event.video_error = str(e)
            event.save(update_fields=['video_status', 'video_error'])
        except:
            pass

        # Retry the task if we haven't exceeded max retries
        if self.request.retries < self.max_retries:
            raise self.retry(exc=e)

        return {'status': 'error', 'message': str(e)}
