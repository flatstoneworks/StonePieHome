"""Settings and wallpaper API routes."""
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.config import UserSettings, get_settings, save_settings
from app.services.wallpaper import (
    WallpaperInfo,
    list_wallpapers,
    upload_wallpaper,
    delete_wallpaper
)

router = APIRouter(prefix="/api/settings", tags=["settings"])


@router.get("", response_model=UserSettings)
async def get_user_settings():
    """Get current user settings."""
    return get_settings()


@router.put("")
async def update_user_settings(settings: UserSettings):
    """Update user settings."""
    save_settings(settings)
    return {"success": True, "message": "Settings updated"}


@router.get("/wallpapers", response_model=list[WallpaperInfo])
async def get_wallpapers():
    """List all available wallpapers (defaults + user uploads)."""
    return list_wallpapers()


@router.post("/wallpapers/upload", response_model=WallpaperInfo)
async def upload_new_wallpaper(file: UploadFile = File(...)):
    """Upload a custom wallpaper."""
    if not file.content_type or not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")

    return await upload_wallpaper(file)


@router.delete("/wallpapers/{wallpaper_id}")
async def remove_wallpaper(wallpaper_id: str):
    """Delete a user-uploaded wallpaper."""
    if wallpaper_id.startswith("default-"):
        raise HTTPException(status_code=400, detail="Cannot delete default wallpapers")

    if delete_wallpaper(wallpaper_id):
        return {"success": True, "message": "Wallpaper deleted"}
    raise HTTPException(status_code=404, detail="Wallpaper not found")
