# StonePieHome

A modern web dashboard for managing your Personal AI workstation. Monitor system resources, manage services, Docker containers, and network status from a beautiful, customizable interface.

Part of the **StonePie** Personal AI Suite by [FlatStoneWorks](https://github.com/flatstoneworks).

## Features

### Dashboard
- **Personalized Greeting** - Time-based welcome message with your name
- **Wallpaper Backgrounds** - Choose from bundled wallpapers or upload your own
- **Live System Metrics** - Real-time CPU, RAM, GPU, and storage monitoring
- **GPU Dashboard** - NVIDIA GPU utilization, VRAM usage, and temperature
- **App Grid** - Beautiful gradient icons with status indicators
- **Quick Access Dock** - Pin your favorite apps for instant launch
- **Wi-Fi Status** - View connection status and available networks

### Settings
- **Device Info** - Hostname, OS, IP address, and uptime
- **Wallpaper Picker** - Browse and select from available wallpapers
- **Custom Uploads** - Upload your own wallpaper images
- **Account Settings** - Configure your display name
- **System Actions** - Restart and shutdown controls

### Management
- **Service Management** - Start, stop, and restart your local services
- **Docker Management** - View and control Docker containers
- **Network Status** - Monitor network interfaces and connectivity

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
- NetworkManager (Wi-Fi via nmcli)

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

### System
```
GET  /api/system              # System metrics (CPU, RAM, GPU)
GET  /api/system/info         # Device info (hostname, OS, IP, uptime)
```

### Settings
```
GET  /api/settings            # User settings
PUT  /api/settings            # Update settings
GET  /api/settings/wallpapers # List wallpapers
POST /api/settings/wallpapers/upload  # Upload wallpaper
```

### Wi-Fi
```
GET  /api/wifi                # Wi-Fi status and networks
GET  /api/wifi/status         # Connection status only
GET  /api/wifi/networks       # Available networks
POST /api/wifi/scan           # Trigger network scan
```

### Services
```
GET  /api/services            # List services
POST /api/services/{name}/start|stop|restart
GET  /api/services/{name}/logs
```

### Docker
```
GET  /api/docker/containers   # List containers
GET  /api/docker/info         # Docker system info
POST /api/docker/containers/{id}/start|stop|restart
```

### Network
```
GET  /api/network/status      # Network interfaces
GET  /api/network/connections # Active connections
```

## Configuration

### Services

Services are configured in `backend/app/services/process.py`:

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

### User Settings

User preferences are stored in `data/settings.yaml`:

```yaml
user_name: Florent
wallpaper: default-1
dock_apps:
  - FilaMama
  - TextAile
theme: dark
```

### Wallpapers

- **Bundled**: `backend/static/wallpapers/`
- **User uploads**: `data/wallpapers/`

## Requirements

- Python 3.10+
- Node.js 18+
- NVIDIA drivers (for GPU monitoring)
- NetworkManager (for Wi-Fi features)
- Docker (optional, for container management)

## License

MIT
