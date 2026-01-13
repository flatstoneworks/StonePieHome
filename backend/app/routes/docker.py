from fastapi import APIRouter, HTTPException, Query
import subprocess
import json
from typing import Optional
from pydantic import BaseModel

router = APIRouter(prefix="/api/docker", tags=["docker"])


class ContainerInfo(BaseModel):
    id: str
    name: str
    image: str
    status: str
    state: str
    ports: list[str]
    created: str
    size: Optional[str] = None


class ContainerActionResponse(BaseModel):
    success: bool
    message: str


class ContainerStats(BaseModel):
    id: str
    name: str
    cpu_percent: float
    memory_usage: str
    memory_limit: str
    memory_percent: float
    network_io: str
    block_io: str


def run_docker_command(args: list[str]) -> tuple[bool, str]:
    """Run a docker command and return success status and output."""
    try:
        result = subprocess.run(
            ["docker"] + args,
            capture_output=True,
            text=True,
            timeout=30
        )
        if result.returncode == 0:
            return True, result.stdout
        else:
            return False, result.stderr
    except subprocess.TimeoutExpired:
        return False, "Command timed out"
    except FileNotFoundError:
        return False, "Docker not found"
    except Exception as e:
        return False, str(e)


@router.get("/containers", response_model=list[ContainerInfo])
async def list_containers(all: bool = Query(default=True, description="Show all containers, not just running")):
    """List all Docker containers."""
    args = ["ps", "--format", "json", "--no-trunc"]
    if all:
        args.append("-a")

    success, output = run_docker_command(args)
    if not success:
        # Return empty list if docker isn't available
        return []

    containers = []
    for line in output.strip().split('\n'):
        if not line:
            continue
        try:
            data = json.loads(line)
            containers.append(ContainerInfo(
                id=data.get("ID", "")[:12],
                name=data.get("Names", ""),
                image=data.get("Image", ""),
                status=data.get("Status", ""),
                state=data.get("State", ""),
                ports=data.get("Ports", "").split(", ") if data.get("Ports") else [],
                created=data.get("CreatedAt", ""),
            ))
        except json.JSONDecodeError:
            continue

    return containers


@router.get("/containers/{container_id}/stats", response_model=ContainerStats)
async def get_container_stats(container_id: str):
    """Get stats for a specific container."""
    args = ["stats", "--no-stream", "--format", "json", container_id]
    success, output = run_docker_command(args)
    if not success:
        raise HTTPException(status_code=500, detail=output)

    try:
        data = json.loads(output.strip())
        # Parse CPU percentage
        cpu_str = data.get("CPUPerc", "0%").replace("%", "")
        cpu_percent = float(cpu_str) if cpu_str else 0.0

        # Parse memory percentage
        mem_str = data.get("MemPerc", "0%").replace("%", "")
        mem_percent = float(mem_str) if mem_str else 0.0

        return ContainerStats(
            id=container_id,
            name=data.get("Name", ""),
            cpu_percent=cpu_percent,
            memory_usage=data.get("MemUsage", "").split(" / ")[0] if " / " in data.get("MemUsage", "") else data.get("MemUsage", ""),
            memory_limit=data.get("MemUsage", "").split(" / ")[1] if " / " in data.get("MemUsage", "") else "",
            memory_percent=mem_percent,
            network_io=data.get("NetIO", ""),
            block_io=data.get("BlockIO", ""),
        )
    except (json.JSONDecodeError, IndexError) as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse stats: {str(e)}")


@router.post("/containers/{container_id}/start", response_model=ContainerActionResponse)
async def start_container(container_id: str):
    """Start a container."""
    success, output = run_docker_command(["start", container_id])
    if success:
        return ContainerActionResponse(success=True, message=f"Started container {container_id}")
    else:
        raise HTTPException(status_code=400, detail=output)


@router.post("/containers/{container_id}/stop", response_model=ContainerActionResponse)
async def stop_container(container_id: str):
    """Stop a container."""
    success, output = run_docker_command(["stop", container_id])
    if success:
        return ContainerActionResponse(success=True, message=f"Stopped container {container_id}")
    else:
        raise HTTPException(status_code=400, detail=output)


@router.post("/containers/{container_id}/restart", response_model=ContainerActionResponse)
async def restart_container(container_id: str):
    """Restart a container."""
    success, output = run_docker_command(["restart", container_id])
    if success:
        return ContainerActionResponse(success=True, message=f"Restarted container {container_id}")
    else:
        raise HTTPException(status_code=400, detail=output)


@router.get("/containers/{container_id}/logs")
async def get_container_logs(container_id: str, lines: int = Query(default=100, le=1000)):
    """Get logs for a container."""
    args = ["logs", "--tail", str(lines), container_id]
    success, output = run_docker_command(args)
    if not success:
        # Try stderr as docker logs outputs to stderr
        result = subprocess.run(
            ["docker"] + args,
            capture_output=True,
            text=True,
            timeout=30
        )
        output = result.stdout + result.stderr

    return {"logs": output.split('\n'), "container": container_id}


@router.get("/info")
async def get_docker_info():
    """Get Docker system info."""
    success, output = run_docker_command(["info", "--format", "json"])
    if not success:
        # Return None if docker isn't available
        return None

    try:
        data = json.loads(output)
        return {
            "containers": data.get("Containers", 0),
            "containers_running": data.get("ContainersRunning", 0),
            "containers_paused": data.get("ContainersPaused", 0),
            "containers_stopped": data.get("ContainersStopped", 0),
            "images": data.get("Images", 0),
            "server_version": data.get("ServerVersion", ""),
            "storage_driver": data.get("Driver", ""),
            "memory_total": data.get("MemTotal", 0),
            "cpus": data.get("NCPU", 0),
        }
    except json.JSONDecodeError:
        return None
