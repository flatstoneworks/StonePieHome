"""System action routes (UI-only stubs for now)."""
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/api/actions", tags=["actions"])


class ActionResponse(BaseModel):
    """Response model for system actions."""
    success: bool
    message: str


@router.post("/restart", response_model=ActionResponse)
async def restart_system():
    """
    Request system restart.

    Note: Currently UI-only mode - logs the intent but doesn't
    actually restart the system. Implement actual restart logic
    when ready for production use.
    """
    # TODO: Implement actual restart when ready
    # import subprocess
    # subprocess.run(['sudo', 'reboot'], check=True)
    return ActionResponse(
        success=True,
        message="Restart requested (UI-only mode - no action taken)"
    )


@router.post("/shutdown", response_model=ActionResponse)
async def shutdown_system():
    """
    Request system shutdown.

    Note: Currently UI-only mode - logs the intent but doesn't
    actually shutdown the system. Implement actual shutdown logic
    when ready for production use.
    """
    # TODO: Implement actual shutdown when ready
    # import subprocess
    # subprocess.run(['sudo', 'poweroff'], check=True)
    return ActionResponse(
        success=True,
        message="Shutdown requested (UI-only mode - no action taken)"
    )


@router.post("/logout", response_model=ActionResponse)
async def logout():
    """
    Log out the current user.

    Note: Currently a placeholder - implement when authentication
    is added to the system.
    """
    return ActionResponse(
        success=True,
        message="Logout requested (no authentication configured)"
    )
