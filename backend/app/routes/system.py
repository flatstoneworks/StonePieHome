from fastapi import APIRouter
from app.services.metrics import get_system_metrics
from app.models import SystemMetrics

router = APIRouter(prefix="/api/system", tags=["system"])


@router.get("", response_model=SystemMetrics)
async def get_metrics():
    """Get current system metrics (CPU, RAM, GPU, etc.)."""
    return get_system_metrics()
