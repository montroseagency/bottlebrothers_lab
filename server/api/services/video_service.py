"""
Video conversion service using FFmpeg.
Handles MP4 to WebM conversion for event videos.
"""
import os
import subprocess
import logging
import uuid
import json
from pathlib import Path
from django.conf import settings

logger = logging.getLogger(__name__)


class VideoConversionError(Exception):
    """Custom exception for video conversion errors."""
    pass


def get_ffmpeg_path():
    """Get the FFmpeg executable path."""
    # Check if FFmpeg is in PATH
    ffmpeg_cmd = 'ffmpeg'

    # On Windows, check common locations
    if os.name == 'nt':
        common_paths = [
            r'C:\ffmpeg\bin\ffmpeg.exe',
            r'C:\Program Files\ffmpeg\bin\ffmpeg.exe',
            r'C:\Program Files (x86)\ffmpeg\bin\ffmpeg.exe',
        ]
        for path in common_paths:
            if os.path.exists(path):
                return path

    return ffmpeg_cmd


def get_ffprobe_path():
    """Get the FFprobe executable path."""
    ffprobe_cmd = 'ffprobe'

    if os.name == 'nt':
        common_paths = [
            r'C:\ffmpeg\bin\ffprobe.exe',
            r'C:\Program Files\ffmpeg\bin\ffprobe.exe',
            r'C:\Program Files (x86)\ffmpeg\bin\ffprobe.exe',
        ]
        for path in common_paths:
            if os.path.exists(path):
                return path

    return ffprobe_cmd


def validate_video_file(file_path):
    """
    Validate that the file is a valid video file.

    Args:
        file_path: Path to the video file

    Returns:
        tuple: (is_valid, error_message)
    """
    if not os.path.exists(file_path):
        return False, "File does not exist"

    file_size = os.path.getsize(file_path)
    max_size = getattr(settings, 'MAX_VIDEO_SIZE', 100 * 1024 * 1024)

    if file_size > max_size:
        return False, f"File size ({file_size} bytes) exceeds maximum allowed ({max_size} bytes)"

    # Use FFprobe to validate the video
    try:
        ffprobe = get_ffprobe_path()
        result = subprocess.run(
            [
                ffprobe,
                '-v', 'quiet',
                '-print_format', 'json',
                '-show_format',
                '-show_streams',
                str(file_path)
            ],
            capture_output=True,
            text=True,
            timeout=30
        )

        if result.returncode != 0:
            return False, "Invalid video file format"

        probe_data = json.loads(result.stdout)

        # Check if there's at least one video stream
        streams = probe_data.get('streams', [])
        has_video = any(s.get('codec_type') == 'video' for s in streams)

        if not has_video:
            return False, "File does not contain a video stream"

        return True, None

    except subprocess.TimeoutExpired:
        return False, "Video validation timed out"
    except json.JSONDecodeError:
        return False, "Could not parse video metadata"
    except FileNotFoundError:
        return False, "FFprobe not found. Please install FFmpeg."
    except Exception as e:
        logger.error(f"Video validation error: {e}")
        return False, str(e)


def get_video_duration(file_path):
    """
    Get the duration of a video file in seconds.

    Args:
        file_path: Path to the video file

    Returns:
        float: Duration in seconds, or None if unable to determine
    """
    try:
        ffprobe = get_ffprobe_path()
        result = subprocess.run(
            [
                ffprobe,
                '-v', 'quiet',
                '-print_format', 'json',
                '-show_format',
                str(file_path)
            ],
            capture_output=True,
            text=True,
            timeout=30
        )

        if result.returncode == 0:
            probe_data = json.loads(result.stdout)
            duration = probe_data.get('format', {}).get('duration')
            if duration:
                return float(duration)

        return None

    except Exception as e:
        logger.error(f"Error getting video duration: {e}")
        return None


def convert_mp4_to_webm(input_path, output_path, quality='medium'):
    """
    Convert an MP4 video to WebM format using VP9 codec.

    Args:
        input_path: Path to the input MP4 file
        output_path: Path for the output WebM file
        quality: Quality preset ('low', 'medium', 'high')

    Returns:
        tuple: (success, error_message)
    """
    # Quality presets (CRF values - lower is better quality)
    quality_presets = {
        'low': 40,      # Smaller file, lower quality
        'medium': 32,   # Balanced
        'high': 24,     # Larger file, higher quality
    }

    crf = quality_presets.get(quality, 32)

    # Ensure output directory exists
    output_dir = os.path.dirname(output_path)
    if output_dir:
        os.makedirs(output_dir, exist_ok=True)

    try:
        ffmpeg = get_ffmpeg_path()
        timeout = getattr(settings, 'VIDEO_CONVERSION_TIMEOUT', 1800)

        # FFmpeg command for VP9 WebM conversion
        # Using two-pass encoding for better quality (single pass for simplicity here)
        cmd = [
            ffmpeg,
            '-y',  # Overwrite output file
            '-i', str(input_path),
            '-c:v', 'libvpx-vp9',  # VP9 video codec
            '-crf', str(crf),
            '-b:v', '0',  # Variable bitrate
            '-c:a', 'libopus',  # Opus audio codec
            '-b:a', '128k',  # Audio bitrate
            '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2',  # Ensure even dimensions
            '-threads', '4',  # Use multiple threads
            '-speed', '2',  # Encoding speed (0-4, higher is faster but lower quality)
            '-row-mt', '1',  # Row-based multithreading
            str(output_path)
        ]

        logger.info(f"Starting video conversion: {input_path} -> {output_path}")

        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=timeout
        )

        if result.returncode != 0:
            error_msg = result.stderr or "Unknown conversion error"
            logger.error(f"FFmpeg conversion failed: {error_msg}")
            return False, f"Conversion failed: {error_msg[:500]}"

        # Verify output file exists and has content
        if not os.path.exists(output_path):
            return False, "Output file was not created"

        if os.path.getsize(output_path) == 0:
            os.remove(output_path)
            return False, "Output file is empty"

        logger.info(f"Video conversion completed successfully: {output_path}")
        return True, None

    except subprocess.TimeoutExpired:
        logger.error(f"Video conversion timed out after {timeout} seconds")
        # Clean up partial output
        if os.path.exists(output_path):
            os.remove(output_path)
        return False, f"Conversion timed out after {timeout} seconds"

    except FileNotFoundError:
        return False, "FFmpeg not found. Please install FFmpeg and add it to PATH."

    except Exception as e:
        logger.error(f"Video conversion error: {e}")
        if os.path.exists(output_path):
            os.remove(output_path)
        return False, str(e)


def cleanup_video_files(file_paths):
    """
    Remove video files.

    Args:
        file_paths: List of file paths to remove
    """
    for path in file_paths:
        try:
            if path and os.path.exists(path):
                os.remove(path)
                logger.info(f"Removed video file: {path}")
        except Exception as e:
            logger.error(f"Error removing file {path}: {e}")


def generate_video_filename(original_filename, format_ext='mp4'):
    """
    Generate a unique filename for video storage.

    Args:
        original_filename: Original filename
        format_ext: File extension for the output

    Returns:
        str: Unique filename
    """
    unique_id = uuid.uuid4().hex
    return f"{unique_id}.{format_ext}"
