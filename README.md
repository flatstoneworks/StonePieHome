# StonePieHome

A modern web dashboard for managing your Personal AI workstation. Monitor system resources, manage services, Docker containers, and network status from a single interface.

Part of the **StonePie** Personal AI Suite by [FlatStoneWorks](https://github.com/flatstoneworks).

## Features

- **System Monitoring** - Real-time CPU, RAM, GPU, and storage metrics
- **GPU Dashboard** - NVIDIA GPU utilization, VRAM usage, and temperature
- **Service Management** - Start, stop, and restart your local services
- **Docker Management** - View and control Docker containers
- **Network Status** - Monitor network interfaces and connectivity
- **App Launcher** - Quick access to your web applications

## Screenshots

| Dashboard | Services |
|-----------|----------|
| System metrics and app grid | Service controls with status |

| Docker | Network |
|--------|---------|
| Container management | Interface monitoring |

## Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite
- TanStack Query
- Tailwind CSS + shadcn/ui
- Lucide React icons

**Backend:**
- FastAPI (Python)
- psutil (system metrics)
- pynvml (NVIDIA GPU metrics)

## Quick Start

```bash
# Clone the repository
git clone https://github.com/flatstoneworks/StonePieHome.git
cd StonePieHome

# Start both frontend and backend
./start.sh
```

Open http://spark.local:8020 in your browser.

## Manual Setup

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8021
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Port Allocation

| Service | Port |
|---------|------|
| Frontend | 8020 |
| Backend API | 8021 |
| API Docs | 8021/docs |

## API Endpoints

```
GET  /api/system              # System metrics (CPU, RAM, GPU)
GET  /api/services            # List services
POST /api/services/{name}/start|stop|restart
GET  /api/docker/containers   # List Docker containers
GET  /api/docker/info         # Docker system info
GET  /api/network/status      # Network interfaces
```

## Configuration

Services are configured in `backend/app/services/process.py`. Add your own services:

```python
KNOWN_SERVICES = {
    "MyApp": {
        "path": "/path/to/myapp",
        "frontend_port": 3000,
        "backend_port": 3001,
        "start_cmd": "./start.sh",
        "icon": "box",  # Lucide icon name
        "description": "My Application"
    }
}
```

## Requirements

- Python 3.10+
- Node.js 18+
- NVIDIA drivers (for GPU monitoring)
- Docker (optional, for container management)

## License

MIT
