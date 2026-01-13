from pydantic import BaseModel
from typing import Optional
from enum import Enum


class ServiceStatus(str, Enum):
    RUNNING = "running"
    STOPPED = "stopped"
    ERROR = "error"
    UNKNOWN = "unknown"


class SystemMetrics(BaseModel):
    cpu_percent: float
    cpu_per_core: list[float]
    cpu_count: int
    memory_total: int
    memory_used: int
    memory_percent: float
    disk_total: int
    disk_used: int
    disk_percent: float
    gpu_name: Optional[str] = None
    gpu_memory_total: Optional[int] = None
    gpu_memory_used: Optional[int] = None
    gpu_memory_percent: Optional[float] = None
    gpu_utilization: Optional[float] = None
    gpu_temperature: Optional[float] = None
    cpu_temperature: Optional[float] = None


class ServiceInfo(BaseModel):
    name: str
    description: str
    icon: str
    path: str
    frontend_port: Optional[int] = None
    backend_port: Optional[int] = None
    websocket_port: Optional[int] = None
    status: ServiceStatus
    frontend_running: bool = False
    backend_running: bool = False


class ServiceAction(str, Enum):
    START = "start"
    STOP = "stop"
    RESTART = "restart"


class ServiceActionResponse(BaseModel):
    success: bool
    message: str


class LogsResponse(BaseModel):
    logs: list[str]
    service: str


class PortAllocation(BaseModel):
    project: str
    port: int
    service: str
    status: ServiceStatus
