import socket
import subprocess
import os
from typing import Optional
from app.models import ServiceInfo, ServiceStatus

# Known services configuration
KNOWN_SERVICES = {
    "FilaMama": {
        "path": "/home/flatstone/Claude/FLATSTONE/FilaMama",
        "frontend_port": 5100,
        "backend_port": 5101,
        "start_cmd": "./start.sh",
        "icon": "folder",
        "description": "File Manager"
    },
    "HollyWool": {
        "path": "/home/flatstone/Claude/FLATSTONE/HollyWool",
        "frontend_port": 5173,
        "backend_port": 5172,
        "start_cmd": "./start.sh",
        "icon": "image",
        "description": "AI Image & Video Generation"
    },
    "TextAile": {
        "path": "/home/flatstone/Claude/FLATSTONE/TextAile",
        "frontend_port": 5174,
        "backend_port": 8001,
        "start_cmd": "./start.sh",
        "icon": "message-square",
        "description": "AI Chat Interface"
    },
    "YoungerYou": {
        "path": "/home/flatstone/Claude/FLATSTONE/YoungerYou",
        "frontend_port": 4446,
        "websocket_port": 4444,
        "start_cmd": "./start.sh",
        "icon": "sparkles",
        "description": "AI Age Transformation"
    }
}


def is_port_in_use(port: int) -> bool:
    """Check if a port is in use."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        try:
            s.bind(('', port))
            return False
        except socket.error:
            return True


def get_service_status(service_config: dict) -> tuple[ServiceStatus, bool, bool]:
    """Get the status of a service by checking its ports."""
    frontend_port = service_config.get("frontend_port")
    backend_port = service_config.get("backend_port")
    websocket_port = service_config.get("websocket_port")

    frontend_running = frontend_port is not None and is_port_in_use(frontend_port)
    backend_running = backend_port is not None and is_port_in_use(backend_port)

    # Also check websocket port if defined
    if websocket_port and not backend_running:
        backend_running = is_port_in_use(websocket_port)

    if frontend_running or backend_running:
        status = ServiceStatus.RUNNING
    else:
        status = ServiceStatus.STOPPED

    return status, frontend_running, backend_running


def get_all_services() -> list[ServiceInfo]:
    """Get information about all known services."""
    services = []
    for name, config in KNOWN_SERVICES.items():
        status, frontend_running, backend_running = get_service_status(config)
        services.append(ServiceInfo(
            name=name,
            description=config["description"],
            icon=config["icon"],
            path=config["path"],
            frontend_port=config.get("frontend_port"),
            backend_port=config.get("backend_port"),
            websocket_port=config.get("websocket_port"),
            status=status,
            frontend_running=frontend_running,
            backend_running=backend_running,
        ))
    return services


def start_service(name: str) -> tuple[bool, str]:
    """Start a service."""
    if name not in KNOWN_SERVICES:
        return False, f"Unknown service: {name}"

    config = KNOWN_SERVICES[name]
    path = config["path"]
    start_cmd = config.get("start_cmd", "./start.sh")

    if not os.path.exists(path):
        return False, f"Service path not found: {path}"

    start_script = os.path.join(path, start_cmd)
    if not os.path.exists(start_script):
        return False, f"Start script not found: {start_script}"

    try:
        # Start the service in the background
        subprocess.Popen(
            [start_script],
            cwd=path,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            start_new_session=True
        )
        return True, f"Started {name}"
    except Exception as e:
        return False, f"Failed to start {name}: {str(e)}"


def stop_service(name: str) -> tuple[bool, str]:
    """Stop a service by killing processes on its ports."""
    if name not in KNOWN_SERVICES:
        return False, f"Unknown service: {name}"

    config = KNOWN_SERVICES[name]
    ports_to_kill = []

    if config.get("frontend_port"):
        ports_to_kill.append(config["frontend_port"])
    if config.get("backend_port"):
        ports_to_kill.append(config["backend_port"])
    if config.get("websocket_port"):
        ports_to_kill.append(config["websocket_port"])

    killed = False
    for port in ports_to_kill:
        try:
            # Find and kill process using the port
            result = subprocess.run(
                ["lsof", "-ti", f":{port}"],
                capture_output=True,
                text=True
            )
            if result.stdout.strip():
                pids = result.stdout.strip().split('\n')
                for pid in pids:
                    subprocess.run(["kill", "-9", pid], capture_output=True)
                    killed = True
        except Exception:
            pass

    if killed:
        return True, f"Stopped {name}"
    else:
        return True, f"{name} was not running"


def get_service_logs(name: str, lines: int = 100) -> list[str]:
    """Get recent logs for a service."""
    if name not in KNOWN_SERVICES:
        return [f"Unknown service: {name}"]

    config = KNOWN_SERVICES[name]
    path = config["path"]

    # Look for common log files
    log_files = [
        os.path.join(path, "logs", "app.log"),
        os.path.join(path, "backend", "logs", "app.log"),
        os.path.join(path, "output.log"),
        os.path.join(path, "backend", "output.log"),
    ]

    for log_file in log_files:
        if os.path.exists(log_file):
            try:
                with open(log_file, 'r') as f:
                    all_lines = f.readlines()
                    return [line.rstrip() for line in all_lines[-lines:]]
            except Exception as e:
                return [f"Error reading log file: {str(e)}"]

    return [f"No log files found for {name}"]
