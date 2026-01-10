# Video Upload with Celery MP4 to WebM Conversion - Implementation Plan

## Overview
Add video upload capability to the admin events section with background video conversion from MP4 to WebM using Celery workers.

---

## Architecture Analysis Summary

**What's Already in Place:**
- Celery 5.3.4 + Redis 5.0.1 configured in settings (just needs tasks)
- Event model with image upload support
- Admin EventsManagement component with file upload patterns
- JWT authentication and admin-protected routes
- Media storage at `/media/events/`

**What Needs to Be Added:**
- FFmpeg for video conversion
- Video model fields or separate EventVideo model
- Celery app configuration file
- Video conversion task
- Video upload endpoint
- Frontend video upload UI with status tracking

---

## Implementation Steps

### Phase 1: Backend - Celery Setup & Video Model

#### Step 1.1: Create Celery App Configuration
**File:** `server/server/celery.py`

Create Celery app instance that Django can use:
- Import Celery and configure with Django settings
- Auto-discover tasks from all installed apps
- Set default config from Django settings

#### Step 1.2: Update Django Init for Celery
**File:** `server/server/__init__.py`

Add Celery app import so it loads when Django starts.

#### Step 1.3: Add Video Fields to Event Model
**File:** `server/api/models.py`

Add new fields to Event model:
```python
# Video fields
video_original = models.FileField(upload_to='events/videos/original/', null=True, blank=True)
video_webm = models.FileField(upload_to='events/videos/webm/', null=True, blank=True)
video_status = models.CharField(max_length=20, choices=[
    ('none', 'No Video'),
    ('uploading', 'Uploading'),
    ('processing', 'Processing'),
    ('completed', 'Completed'),
    ('failed', 'Failed')
], default='none')
video_task_id = models.CharField(max_length=255, null=True, blank=True)  # Celery task ID
video_duration = models.FloatField(null=True, blank=True)  # Duration in seconds
video_error = models.TextField(null=True, blank=True)  # Error message if failed
```

#### Step 1.4: Create Database Migration
Run `python manage.py makemigrations` to create migration for new video fields.

---

### Phase 2: Backend - Video Conversion Service

#### Step 2.1: Create FFmpeg Wrapper Service
**File:** `server/api/services/video_service.py`

Create service with functions:
- `validate_video_file(file)` - Check file is valid MP4
- `convert_mp4_to_webm(input_path, output_path)` - FFmpeg conversion
- `get_video_duration(file_path)` - Extract duration metadata
- `cleanup_temp_files(paths)` - Remove temporary files

#### Step 2.2: Create Celery Tasks
**File:** `server/api/tasks.py`

Create video conversion task:
```python
@shared_task(bind=True)
def convert_video_to_webm(self, event_id):
    """
    Background task to convert MP4 to WebM
    - Update event status to 'processing'
    - Run FFmpeg conversion
    - Save WebM file
    - Update event status to 'completed' or 'failed'
    """
```

---

### Phase 3: Backend - API Endpoints

#### Step 3.1: Update Event Serializer
**File:** `server/api/serializers.py`

Add video fields to EventSerializer:
- `video_original_url` (read-only, full URL)
- `video_webm_url` (read-only, full URL)
- `video_status` (read-only)
- `video_duration` (read-only)
- `video_error` (read-only)

#### Step 3.2: Add Video Upload Endpoint
**File:** `server/api/views/EventViews.py`

Add new actions to EventViewSet:
```python
@action(detail=True, methods=['post'], parser_classes=[MultiPartParser])
def upload_video(self, request, pk=None):
    """Upload MP4 video and trigger conversion task"""

@action(detail=True, methods=['get'])
def video_status(self, request, pk=None):
    """Get current video conversion status"""

@action(detail=True, methods=['delete'])
def delete_video(self, request, pk=None):
    """Delete video files and reset status"""
```

---

### Phase 4: Frontend - Admin UI

#### Step 4.1: Update EventsManagement Component
**File:** `client/src/components/admin/EventsManagement.tsx`

Add to the existing form:
- Video upload input (accept MP4 only)
- Upload progress indicator
- Video status display (processing/completed/failed)
- Video preview player (when completed)
- Delete video button

#### Step 4.2: Add API Functions
**File:** `client/src/lib/api/index.ts`

Add video-related API functions:
- `uploadEventVideo(eventId, file)` - Upload with progress tracking
- `getEventVideoStatus(eventId)` - Poll conversion status
- `deleteEventVideo(eventId)` - Remove video

---

### Phase 5: System Requirements

#### Step 5.1: Install FFmpeg
FFmpeg must be installed on the system:
- **Windows:** Download from ffmpeg.org and add to PATH
- **Linux:** `apt-get install ffmpeg`
- **Mac:** `brew install ffmpeg`

#### Step 5.2: Add Python Dependencies
**File:** `server/Requirements.txt`

Add: `ffmpeg-python==0.2.0` (optional, can use subprocess directly)

---

## File Changes Summary

### New Files:
1. `server/server/celery.py` - Celery app configuration
2. `server/api/tasks.py` - Celery tasks (video conversion)
3. `server/api/services/video_service.py` - FFmpeg wrapper service

### Modified Files:
1. `server/server/__init__.py` - Import Celery app
2. `server/api/models.py` - Add video fields to Event model
3. `server/api/serializers.py` - Add video field serialization
4. `server/api/views/EventViews.py` - Add video upload/status endpoints
5. `client/src/components/admin/EventsManagement.tsx` - Add video upload UI

### New Migration:
1. `server/api/migrations/XXXX_add_event_video_fields.py`

---

## Running the System

After implementation, to run with Celery:

```bash
# Terminal 1: Redis (if not running)
redis-server

# Terminal 2: Django server
cd server
python manage.py runserver

# Terminal 3: Celery worker
cd server
celery -A server worker --loglevel=info

# Terminal 4: Next.js client
cd client
npm run dev
```

---

## Conversion Parameters

WebM conversion settings (VP9 codec for quality):
```bash
ffmpeg -i input.mp4 -c:v libvpx-vp9 -crf 30 -b:v 0 -c:a libopus output.webm
```

Options:
- `-c:v libvpx-vp9`: VP9 video codec (best WebM quality)
- `-crf 30`: Quality (lower = better, 30 is good balance)
- `-b:v 0`: Variable bitrate
- `-c:a libopus`: Opus audio codec

---

## Error Handling

- File validation: Check MIME type is video/mp4
- Size limit: Configurable max video size (default 100MB)
- Conversion timeout: 30 minutes max for large videos
- Retry logic: 3 retries on conversion failure
- Cleanup: Remove temp files on success or failure

---

## Status Flow

```
none -> uploading -> processing -> completed
                  \-> failed (with error message)
```

Frontend polls `/api/events/{id}/video-status/` every 3 seconds while status is "processing".
