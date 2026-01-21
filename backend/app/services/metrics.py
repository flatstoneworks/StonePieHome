import psutil
from typing import Optional
from app.models import SystemMetrics

# Try to import pynvml for NVIDIA GPU support
try:
    import pynvml
    pynvml.nvmlInit()
    NVIDIA_AVAILABLE = True
except Exception:
    NVIDIA_AVAILABLE = False


def get_cpu_temperature() -> Optional[float]:
    """Get CPU temperature if available."""
    try:
        temps = psutil.sensors_temperatures()
        if temps:
            # Try common sensor names
            for name in ['coretemp', 'cpu_thermal', 'k10temp', 'zenpower']:
                if name in temps:
                    # Return average of all cores
                    core_temps = [t.current for t in temps[name]]
                    if core_temps:
                        return sum(core_temps) / len(core_temps)
            # Fallback: try first available sensor
            for sensor_list in temps.values():
                if sensor_list:
                    return sensor_list[0].current
    except Exception:
        pass
    return None


def get_gpu_metrics() -> dict:
    """Get NVIDIA GPU metrics if available."""
    if not NVIDIA_AVAILABLE:
        return {}

    try:
        handle = pynvml.nvmlDeviceGetHandleByIndex(0)
        name = pynvml.nvmlDeviceGetName(handle)
        if isinstance(name, bytes):
            name = name.decode('utf-8')

        memory = pynvml.nvmlDeviceGetMemoryInfo(handle)
        utilization = pynvml.nvmlDeviceGetUtilizationRates(handle)

        try:
            temperature = pynvml.nvmlDeviceGetTemperature(handle, pynvml.NVML_TEMPERATURE_GPU)
        except Exception:
            temperature = None

        return {
            "gpu_name": name,
            "gpu_memory_total": memory.total,
            "gpu_memory_used": memory.used,
            "gpu_memory_percent": (memory.used / memory.total) * 100 if memory.total > 0 else 0,
            "gpu_utilization": utilization.gpu,
            "gpu_temperature": temperature,
        }
    except Exception:
        return {}


def get_system_metrics() -> SystemMetrics:
    """Collect all system metrics."""
    # Get CPU metrics with a single interval call
    # First call gets per-core percentages
    cpu_per_core = psutil.cpu_percent(interval=0.1, percpu=True)
    # Calculate overall percentage from per-core data to avoid second blocking call
    cpu_percent = sum(cpu_per_core) / len(cpu_per_core) if cpu_per_core else 0.0
    cpu_count = psutil.cpu_count()

    memory = psutil.virtual_memory()
    disk = psutil.disk_usage('/')

    gpu_metrics = get_gpu_metrics()
    cpu_temp = get_cpu_temperature()

    return SystemMetrics(
        cpu_percent=cpu_percent,
        cpu_per_core=cpu_per_core,
        cpu_count=cpu_count,
        memory_total=memory.total,
        memory_used=memory.used,
        memory_percent=memory.percent,
        disk_total=disk.total,
        disk_used=disk.used,
        disk_percent=disk.percent,
        cpu_temperature=cpu_temp,
        **gpu_metrics
    )
