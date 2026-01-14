"""Wallpaper management service."""
import os
import uuid
import shutil
from pathlib import Path
from typing import Optional
from pydantic import BaseModel
from fastapi import UploadFile

# Directories
STATIC_DIR = Path(__file__).parent.parent.parent / "static"
DEFAULT_WALLPAPERS_DIR = STATIC_DIR / "wallpapers"
DATA_DIR = Path(__file__).parent.parent.parent.parent / "data"
USER_WALLPAPERS_DIR = DATA_DIR / "wallpapers"

# Bundled default wallpapers
DEFAULT_WALLPAPERS = [
    {"id": "default-1", "name": "Mountain Night", "filename": "mountain-night.jpg"},
    {"id": "default-2", "name": "Ocean Blue", "filename": "ocean-blue.jpg"},
    {"id": "default-3", "name": "Forest Green", "filename": "forest-green.jpg"},
    {"id": "default-4", "name": "City Lights", "filename": "city-lights.jpg"},
    {"id": "default-5", "name": "Abstract Dark", "filename": "abstract-dark.jpg"},
]


class WallpaperInfo(BaseModel):
    """Wallpaper information model."""
    id: str
    name: str
    url: str
    thumbnail_url: str
    is_default: bool = False


def ensure_directories() -> None:
    """Ensure wallpaper directories exist."""
    DEFAULT_WALLPAPERS_DIR.mkdir(parents=True, exist_ok=True)
    USER_WALLPAPERS_DIR.mkdir(parents=True, exist_ok=True)


def list_wallpapers() -> list[WallpaperInfo]:
    """List all available wallpapers (defaults + user uploads)."""
    ensure_directories()
    wallpapers = []

    # Add default wallpapers
    for wp in DEFAULT_WALLPAPERS:
        filepath = DEFAULT_WALLPAPERS_DIR / wp["filename"]
        if filepath.exists():
            wallpapers.append(WallpaperInfo(
                id=wp["id"],
                name=wp["name"],
                url=f"/static/wallpapers/{wp['filename']}",
                thumbnail_url=f"/static/wallpapers/{wp['filename']}",
                is_default=True
            ))

    # Add user-uploaded wallpapers
    if USER_WALLPAPERS_DIR.exists():
        for file in USER_WALLPAPERS_DIR.iterdir():
            if file.suffix.lower() in ['.jpg', '.jpeg', '.png', '.webp']:
                wallpaper_id = f"user-{file.stem}"
                wallpapers.append(WallpaperInfo(
                    id=wallpaper_id,
                    name=file.stem.replace('-', ' ').replace('_', ' ').title(),
                    url=f"/data/wallpapers/{file.name}",
                    thumbnail_url=f"/data/wallpapers/{file.name}",
                    is_default=False
                ))

    return wallpapers


def get_wallpaper_by_id(wallpaper_id: str) -> Optional[WallpaperInfo]:
    """Get a specific wallpaper by ID."""
    wallpapers = list_wallpapers()
    for wp in wallpapers:
        if wp.id == wallpaper_id:
            return wp
    return None


async def upload_wallpaper(file: UploadFile) -> WallpaperInfo:
    """Handle user wallpaper upload."""
    ensure_directories()

    # Generate unique filename
    ext = Path(file.filename).suffix.lower() if file.filename else '.jpg'
    if ext not in ['.jpg', '.jpeg', '.png', '.webp']:
        ext = '.jpg'

    unique_id = str(uuid.uuid4())[:8]
    filename = f"custom-{unique_id}{ext}"
    filepath = USER_WALLPAPERS_DIR / filename

    # Save the file
    with open(filepath, 'wb') as f:
        content = await file.read()
        f.write(content)

    wallpaper_id = f"user-custom-{unique_id}"
    return WallpaperInfo(
        id=wallpaper_id,
        name=f"Custom {unique_id}",
        url=f"/data/wallpapers/{filename}",
        thumbnail_url=f"/data/wallpapers/{filename}",
        is_default=False
    )


def delete_wallpaper(wallpaper_id: str) -> bool:
    """Delete a user-uploaded wallpaper."""
    if wallpaper_id.startswith("default-"):
        return False  # Cannot delete default wallpapers

    wallpaper = get_wallpaper_by_id(wallpaper_id)
    if wallpaper and not wallpaper.is_default:
        # Extract filename from URL
        filename = wallpaper.url.split('/')[-1]
        filepath = USER_WALLPAPERS_DIR / filename
        if filepath.exists():
            filepath.unlink()
            return True
    return False
