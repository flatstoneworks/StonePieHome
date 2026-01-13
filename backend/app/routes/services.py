from fastapi import APIRouter, HTTPException, Query
from app.services.process import (
    get_all_services,
    start_service,
    stop_service,
    get_service_logs,
    KNOWN_SERVICES,
)
from app.models import ServiceInfo, ServiceActionResponse, LogsResponse

router = APIRouter(prefix="/api/services", tags=["services"])


@router.get("", response_model=list[ServiceInfo])
async def list_services():
    """Get list of all known services with their status."""
    return get_all_services()


@router.post("/{name}/start", response_model=ServiceActionResponse)
async def start_service_endpoint(name: str):
    """Start a service."""
    success, message = start_service(name)
    if not success:
        raise HTTPException(status_code=400, detail=message)
    return ServiceActionResponse(success=success, message=message)


@router.post("/{name}/stop", response_model=ServiceActionResponse)
async def stop_service_endpoint(name: str):
    """Stop a service."""
    success, message = stop_service(name)
    if not success:
        raise HTTPException(status_code=400, detail=message)
    return ServiceActionResponse(success=success, message=message)


@router.post("/{name}/restart", response_model=ServiceActionResponse)
async def restart_service_endpoint(name: str):
    """Restart a service (stop then start)."""
    # Stop first
    stop_service(name)

    # Then start
    success, message = start_service(name)
    if not success:
        raise HTTPException(status_code=400, detail=message)
    return ServiceActionResponse(success=success, message=f"Restarted {name}")


@router.get("/{name}/logs", response_model=LogsResponse)
async def get_logs_endpoint(name: str, lines: int = Query(default=100, le=1000)):
    """Get recent logs for a service."""
    if name not in KNOWN_SERVICES:
        raise HTTPException(status_code=404, detail=f"Unknown service: {name}")
    logs = get_service_logs(name, lines)
    return LogsResponse(logs=logs, service=name)
