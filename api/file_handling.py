"""
Temporary file staging and cleanup handler for EchoForge API.
Safely stages incoming UploadFile streams to temporary disk storage,
prevents path traversal attacks, and guarantees resource cleanup.
"""
import os
import uuid
import tempfile
import pathlib
from typing import Optional, Generator
from contextlib import contextmanager
from fastapi import UploadFile, HTTPException

MAX_UPLOAD_SIZE_BYTES = 50 * 1024 * 1024  # 50 MB max upload limit


def sanitize_filename_extension(filename: Optional[str]) -> str:
    """Extracts and sanitizes file extension, preventing path traversal."""
    if not filename:
        return ".wav"
    # Extract extension from filename safely
    ext = pathlib.Path(filename).suffix.lower()
    # Sanitize extension (only alphanumeric chars)
    clean_ext = "".join(c for c in ext if c.isalnum() or c == ".")
    if not clean_ext or len(clean_ext) > 10:
        return ".wav"
    return clean_ext


def stage_upload_file(upload_file: UploadFile) -> str:
    """
    Safely writes an UploadFile stream to a temporary file on disk.

    Args:
        upload_file: FastAPI UploadFile object.

    Returns:
        str: Absolute path to the temporary staged file.

    Raises:
        HTTPException: If file is empty (400) or exceeds size limit (413).
    """
    if not upload_file or not upload_file.filename:
        raise HTTPException(status_code=400, detail="No audio file provided.")

    ext = sanitize_filename_extension(upload_file.filename)
    temp_dir = tempfile.gettempdir()
    unique_name = f"echoforge_upload_{uuid.uuid4().hex}{ext}"
    temp_file_path = os.path.join(temp_dir, unique_name)

    total_bytes = 0
    try:
        with open(temp_file_path, "wb") as buffer:
            while chunk := upload_file.file.read(8192):
                total_bytes += len(chunk)
                if total_bytes > MAX_UPLOAD_SIZE_BYTES:
                    raise HTTPException(
                        status_code=413,
                        detail=f"Uploaded file exceeds maximum allowed size of {MAX_UPLOAD_SIZE_BYTES // (1024*1024)}MB.",
                    )
                buffer.write(chunk)
    except HTTPException:
        cleanup_staged_file(temp_file_path)
        raise
    except Exception as e:
        cleanup_staged_file(temp_file_path)
        raise HTTPException(status_code=500, detail=f"Failed to stage uploaded file: {e}")

    if total_bytes == 0:
        cleanup_staged_file(temp_file_path)
        raise HTTPException(status_code=400, detail="Uploaded audio file is empty (0 bytes).")

    return os.path.abspath(temp_file_path)


def cleanup_staged_file(file_path: Optional[str]) -> None:
    """Safely removes a temporary staged file if it exists."""
    if file_path and os.path.exists(file_path):
        try:
            os.remove(file_path)
        except Exception:
            pass


@contextmanager
def staged_audio_files(
    audio: UploadFile,
    reference_audio: Optional[UploadFile] = None,
) -> Generator[tuple[str, Optional[str]], None, None]:
    """
    Context manager that stages uploaded audio files and guarantees cleanup.

    Yields:
        tuple[str, Optional[str]]: (staged_audio_path, staged_ref_audio_path)
    """
    audio_path = None
    ref_path = None

    try:
        audio_path = stage_upload_file(audio)
        if reference_audio and reference_audio.filename:
            ref_path = stage_upload_file(reference_audio)

        yield audio_path, ref_path

    finally:
        cleanup_staged_file(audio_path)
        cleanup_staged_file(ref_path)
