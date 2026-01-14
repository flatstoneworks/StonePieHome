"""Wi-Fi management routes."""
import subprocess
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/api/wifi", tags=["wifi"])


class WifiNetwork(BaseModel):
    """Wi-Fi network information."""
    ssid: str
    signal: int
    security: str
    in_use: bool


class WifiStatus(BaseModel):
    """Current Wi-Fi connection status."""
    connected: bool
    ssid: str | None = None
    signal: int | None = None
    device: str | None = None


class WifiInfo(BaseModel):
    """Complete Wi-Fi information."""
    status: WifiStatus
    networks: list[WifiNetwork]


def get_wifi_networks() -> list[WifiNetwork]:
    """Get list of available Wi-Fi networks using nmcli."""
    networks = []
    try:
        result = subprocess.run(
            ['nmcli', '-t', '-f', 'SSID,SIGNAL,SECURITY,IN-USE', 'dev', 'wifi', 'list'],
            capture_output=True,
            text=True,
            timeout=10
        )
        if result.returncode == 0:
            for line in result.stdout.strip().split('\n'):
                if line:
                    parts = line.split(':')
                    if len(parts) >= 4 and parts[0]:  # Skip empty SSIDs
                        ssid = parts[0]
                        try:
                            signal = int(parts[1]) if parts[1] else 0
                        except ValueError:
                            signal = 0
                        security = parts[2] if parts[2] else 'Open'
                        in_use = parts[3] == '*'
                        networks.append(WifiNetwork(
                            ssid=ssid,
                            signal=signal,
                            security=security,
                            in_use=in_use
                        ))
    except Exception:
        pass

    # Sort by signal strength (strongest first), with in-use network at top
    networks.sort(key=lambda x: (not x.in_use, -x.signal))
    return networks


def get_wifi_status() -> WifiStatus:
    """Get current Wi-Fi connection status."""
    try:
        result = subprocess.run(
            ['nmcli', '-t', '-f', 'NAME,TYPE,DEVICE', 'connection', 'show', '--active'],
            capture_output=True,
            text=True,
            timeout=5
        )
        if result.returncode == 0:
            for line in result.stdout.strip().split('\n'):
                parts = line.split(':')
                if len(parts) >= 3 and parts[1] == '802-11-wireless':
                    ssid = parts[0]
                    device = parts[2]
                    # Get signal strength for connected network
                    signal = None
                    networks = get_wifi_networks()
                    for net in networks:
                        if net.in_use:
                            signal = net.signal
                            break
                    return WifiStatus(
                        connected=True,
                        ssid=ssid,
                        signal=signal,
                        device=device
                    )
    except Exception:
        pass

    return WifiStatus(connected=False)


@router.get("", response_model=WifiInfo)
async def get_wifi_info():
    """Get Wi-Fi status and available networks."""
    return WifiInfo(
        status=get_wifi_status(),
        networks=get_wifi_networks()
    )


@router.get("/status", response_model=WifiStatus)
async def get_connection_status():
    """Get current Wi-Fi connection status only."""
    return get_wifi_status()


@router.get("/networks", response_model=list[WifiNetwork])
async def get_available_networks():
    """Get list of available Wi-Fi networks."""
    return get_wifi_networks()


@router.post("/scan")
async def scan_networks():
    """Trigger a Wi-Fi network scan."""
    try:
        subprocess.run(
            ['nmcli', 'dev', 'wifi', 'rescan'],
            capture_output=True,
            timeout=10
        )
        return {"success": True, "message": "Scan initiated"}
    except Exception as e:
        return {"success": False, "message": str(e)}
