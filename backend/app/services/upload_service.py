from datetime import datetime
from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException, UploadFile


REPO_ROOT = Path(__file__).resolve().parents[3]
UPLOAD_ROOT = REPO_ROOT / "backend" / "uploads"
VIDEO_DIR = UPLOAD_ROOT / "videos"
SUBTITLE_DIR = UPLOAD_ROOT / "subtitles"
ALLOWED_VIDEO_EXTENSIONS = {".mp4"}
ALLOWED_SUBTITLE_EXTENSIONS = {".srt", ".vtt", ".txt"}


def ensure_upload_dirs() -> None:
    VIDEO_DIR.mkdir(parents=True, exist_ok=True)
    SUBTITLE_DIR.mkdir(parents=True, exist_ok=True)


def _safe_suffix(filename: str, allowed: set[str], label: str) -> str:
    suffix = Path(filename or "").suffix.lower()
    if suffix not in allowed:
        allowed_values = ", ".join(sorted(allowed))
        raise HTTPException(status_code=400, detail=f"{label} must be one of: {allowed_values}")
    return suffix


def _safe_filename(suffix: str) -> str:
    timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
    return f"{timestamp}_{uuid4().hex}{suffix}"


async def save_video_file(file: UploadFile) -> Path:
    suffix = _safe_suffix(file.filename or "", ALLOWED_VIDEO_EXTENSIONS, "video_file")
    content_type = (file.content_type or "").lower()
    if content_type and content_type not in {"video/mp4", "application/octet-stream"}:
        raise HTTPException(status_code=400, detail="video_file must be mp4")
    ensure_upload_dirs()
    path = VIDEO_DIR / _safe_filename(suffix)
    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="video_file is empty")
    path.write_bytes(contents)
    return path


async def save_subtitle_file(file: UploadFile) -> tuple[Path, str]:
    suffix = _safe_suffix(file.filename or "", ALLOWED_SUBTITLE_EXTENSIONS, "subtitle_file")
    ensure_upload_dirs()
    path = SUBTITLE_DIR / _safe_filename(suffix)
    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="subtitle_file is empty")
    path.write_bytes(contents)
    text = contents.decode("utf-8-sig", errors="replace")
    return path, text
