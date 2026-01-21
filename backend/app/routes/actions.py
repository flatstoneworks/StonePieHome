"""System action routes."""
import os
import subprocess
import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/actions", tags=["actions"])

# Environment flag to enable/disable actual system actions
# Set ENABLE_SYSTEM_ACTIONS=true in environment to enable
ENABLE_ACTIONS = os.getenv("ENABLE_SYSTEM_ACTIONS", "false").lower() == "true"


class ActionResponse(BaseModel):
    """Response model for system actions."""
    success: bool
    message: str


@router.post("/restart", response_model=ActionResponse)
async def restart_system():
    """
    Request system restart.

    Requires ENABLE_SYSTEM_ACTIONS=true environment variable.
    Uses systemctl to safely restart the system with a 10-second delay.
    """
    logger.info("System restart requested")

    if not ENABLE_ACTIONS:
        logger.warning("System restart blocked - ENABLE_SYSTEM_ACTIONS not set")
        return ActionResponse(
            success=False,
            message="System actions disabled. Set ENABLE_SYSTEM_ACTIONS=true to enable."
        )

    try:
        # Schedule restart with 10-second delay for graceful shutdown
        subprocess.Popen(
            ["sudo", "shutdown", "-r", "+0.1"],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )
        logger.info("System restart initiated")
        return ActionResponse(
            success=True,
            message="System will restart in 10 seconds"
        )
    except subprocess.SubprocessError as e:
        logger.error(f"Failed to restart system: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to restart system: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Unexpected error during restart: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error: {str(e)}"
        )


@router.post("/shutdown", response_model=ActionResponse)
async def shutdown_system():
    """
    Request system shutdown.

    Requires ENABLE_SYSTEM_ACTIONS=true environment variable.
    Uses systemctl to safely shutdown the system with a 10-second delay.
    """
    logger.info("System shutdown requested")

    if not ENABLE_ACTIONS:
        logger.warning("System shutdown blocked - ENABLE_SYSTEM_ACTIONS not set")
        return ActionResponse(
            success=False,
            message="System actions disabled. Set ENABLE_SYSTEM_ACTIONS=true to enable."
        )

    try:
        # Schedule shutdown with 10-second delay for graceful shutdown
        subprocess.Popen(
            ["sudo", "shutdown", "-h", "+0.1"],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )
        logger.info("System shutdown initiated")
        return ActionResponse(
            success=True,
            message="System will shut down in 10 seconds"
        )
    except subprocess.SubprocessError as e:
        logger.error(f"Failed to shutdown system: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to shutdown system: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Unexpected error during shutdown: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error: {str(e)}"
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
