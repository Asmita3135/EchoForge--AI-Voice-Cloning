"""
===============================================================================
 EchoForge - Audio & Video Converter Utility (audio_converter.py)
===============================================================================
 Automatically detects, extracts, and converts common audio and video formats 
 into 16 kHz mono 16-bit PCM WAV format using FFmpeg for SpeechBrain processing.

 Supported Audio Formats : .wav, .mp3, .m4a, .aac, .flac, .ogg, .wma
 Supported Video Formats : .mp4, .mkv, .avi, .mov, .webm
===============================================================================
"""

import os
import sys
import shutil
import tempfile
import subprocess
import pathlib

# Define supported file extensions
SUPPORTED_AUDIO_EXTENSIONS = {".wav", ".mp3", ".m4a", ".aac", ".flac", ".ogg", ".wma"}
SUPPORTED_VIDEO_EXTENSIONS = {".mp4", ".mkv", ".avi", ".mov", ".webm"}
ALL_SUPPORTED_EXTENSIONS = SUPPORTED_AUDIO_EXTENSIONS | SUPPORTED_VIDEO_EXTENSIONS


class FFmpegNotFoundError(Exception):
    """Raised when FFmpeg is not installed or not available in Windows PATH."""
    pass


class NoAudioTrackError(Exception):
    """Raised when a video or media file contains no audio stream."""
    pass


class AudioConversionError(Exception):
    """Raised when FFmpeg fails during audio extraction or conversion."""
    pass


def get_ffmpeg_executable() -> str:
    """
    Resolves path to ffmpeg executable.
    First checks system PATH. If missing, checks WinGet package directory in AppData.
    """
    ffmpeg_path = shutil.which("ffmpeg")
    if ffmpeg_path:
        return pathlib.Path(ffmpeg_path).resolve().as_posix()

    # Fallback check for WinGet package directory on Windows
    winget_dir = os.path.expanduser(r"~\AppData\Local\Microsoft\WinGet\Packages")
    if os.path.exists(winget_dir):
        for root, _, files in os.walk(winget_dir):
            if "ffmpeg.exe" in files:
                return pathlib.Path(root, "ffmpeg.exe").resolve().as_posix()

    return "ffmpeg"


def check_ffmpeg_installed() -> bool:
    """
    Checks whether FFmpeg is available by executing 'ffmpeg -version'.
    """
    ffmpeg_bin = get_ffmpeg_executable()
    try:
        result = subprocess.run(
            [ffmpeg_bin, "-version"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            check=False
        )
        return result.returncode == 0
    except (FileNotFoundError, Exception):
        return False


def validate_file_format(file_path: str) -> str:
    """
    Validates file existence and extension against supported audio and video formats.
    Returns lowercased extension.
    """
    path_obj = pathlib.Path(file_path).resolve()
    resolved_str = path_obj.as_posix()

    if not path_obj.exists():
        raise FileNotFoundError(f"Input file not found: '{resolved_str}'")

    ext = path_obj.suffix.lower()

    if ext not in ALL_SUPPORTED_EXTENSIONS:
        raise ValueError(
            f"Unsupported file format: {ext}\n\n"
            f"Supported formats:\n"
            f"  .wav, .mp3, .m4a, .aac, .flac, .ogg, .wma,\n"
            f"  .mp4, .mkv, .avi, .mov, .webm"
        )

    return ext


def has_audio_stream(file_path: str) -> bool:
    """
    Inspects media file metadata using FFmpeg to verify if an audio track exists.
    """
    if not check_ffmpeg_installed():
        return True

    ffmpeg_bin = get_ffmpeg_executable()
    path_str = pathlib.Path(file_path).resolve().as_posix()

    try:
        result = subprocess.run(
            [ffmpeg_bin, "-i", path_str],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            check=False
        )
        stderr_output = result.stderr.lower()
        return "audio:" in stderr_output
    except Exception:
        return True


def convert_to_wav(input_file: str) -> tuple[str, bool]:
    """
    Extracts/converts audio or video input files into a 16 kHz mono 16-bit PCM WAV file.

    Parameters:
    - input_file (str): Path to input audio or video file.

    Returns:
    - tuple[str, bool]: (resolved_abs_wav_path, is_temporary_file)
    """
    input_path = pathlib.Path(input_file).resolve()
    input_str = input_path.as_posix()

    # 1. Validate file format and existence
    ext = validate_file_format(input_str)
    ffmpeg_available = check_ffmpeg_installed()
    ffmpeg_bin = get_ffmpeg_executable()

    # 2. Flow handling for WAV files: Use directly if FFmpeg is absent or already WAV
    if ext == ".wav":
        if not ffmpeg_available:
            return input_str, False

    # 3. For non-WAV files, FFmpeg is required
    if not ffmpeg_available:
        raise FFmpegNotFoundError(
            "FFmpeg is not installed or not found on system PATH.\n\n"
            "Windows Setup Instructions:\n"
            "  1. Open PowerShell as Administrator and run:\n"
            "     winget install --id Gyan.FFmpeg\n"
            "  2. Restart your terminal window.\n"
            "  3. Verify installation using: ffmpeg -version\n"
        )

    # 4. Check for audio stream in media files
    if not has_audio_stream(input_str):
        raise NoAudioTrackError("No audio track found in the supplied video.")

    # 5. Create a temporary output file for converted WAV
    temp_wav = tempfile.NamedTemporaryFile(suffix=".wav", delete=False)
    temp_raw_name = temp_wav.name
    temp_wav.close()

    # Resolve absolute path using pathlib.Path and as_posix() to prevent Windows backslash escaping bugs
    temp_wav_path = pathlib.Path(temp_raw_name).resolve().as_posix()

    # 6. Execute FFmpeg conversion to 16kHz Mono 16-bit PCM WAV
    cmd = [
        ffmpeg_bin,
        "-y",
        "-i", input_str,
        "-ar", "16000",
        "-ac", "1",
        "-sample_fmt", "s16",
        temp_wav_path
    ]

    try:
        result = subprocess.run(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            check=False
        )

        if result.returncode != 0:
            stderr_lower = result.stderr.lower()
            cleanup_temp_file(temp_wav_path)

            if "does not contain any stream" in stderr_lower or "matches no streams" in stderr_lower or "audio" not in stderr_lower:
                raise NoAudioTrackError("No audio track found in the supplied video.")
            else:
                raise AudioConversionError(
                    f"FFmpeg failed to convert file '{input_str}'.\n"
                    f"Technical Log: {result.stderr.strip()}"
                )

        # Confirm converted WAV file exists on disk
        if not os.path.exists(temp_wav_path):
            raise AudioConversionError(f"Converted temporary file was not created: '{temp_wav_path}'")

        return temp_wav_path, True  # Converted temporary WAV file

    except Exception as e:
        cleanup_temp_file(temp_wav_path)
        if isinstance(e, (NoAudioTrackError, FFmpegNotFoundError, ValueError, AudioConversionError)):
            raise e
        raise AudioConversionError(f"Unexpected error during conversion of '{input_str}': {str(e)}")


def cleanup_temp_file(temp_wav_path: str):
    """
    Safely deletes temporary converted WAV files after verification is complete.
    """
    if temp_wav_path and os.path.exists(temp_wav_path):
        try:
            os.remove(temp_wav_path)
        except Exception:
            pass
