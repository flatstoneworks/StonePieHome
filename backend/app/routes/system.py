import socket
import platform
import time
import psutil
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from app.services.metrics import get_system_metrics
from app.models import SystemMetrics

router = APIRouter(prefix="/api/system", tags=["system"])


class DeviceInfo(BaseModel):
    """Device information model."""
    hostname: str
    os: str
    local_ip: str
    uptime_seconds: float
    uptime_formatted: str


def get_local_ip() -> str:
    """Get the local IP address."""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"


def format_uptime(seconds: float) -> str:
    """Format uptime seconds to human-readable string."""
    days = int(seconds // 86400)
    hours = int((seconds % 86400) // 3600)
    minutes = int((seconds % 3600) // 60)

    parts = []
    if days > 0:
        parts.append(f"{days} day{'s' if days != 1 else ''}")
    if hours > 0:
        parts.append(f"{hours} hour{'s' if hours != 1 else ''}")
    if minutes > 0 or not parts:
        parts.append(f"{minutes} minute{'s' if minutes != 1 else ''}")

    return ", ".join(parts)


@router.get("", response_model=SystemMetrics)
async def get_metrics():
    """Get current system metrics (CPU, RAM, GPU, etc.)."""
    return get_system_metrics()


@router.get("/info", response_model=DeviceInfo)
async def get_device_info():
    """Get device information (hostname, OS, IP, uptime)."""
    boot_time = psutil.boot_time()
    uptime_seconds = time.time() - boot_time

    return DeviceInfo(
        hostname=socket.gethostname(),
        os=f"{platform.system()} {platform.release()}",
        local_ip=get_local_ip(),
        uptime_seconds=uptime_seconds,
        uptime_formatted=format_uptime(uptime_seconds)
    )
