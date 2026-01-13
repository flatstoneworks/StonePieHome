from fastapi import APIRouter
import psutil
import socket
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/api/network", tags=["network"])


class NetworkInterface(BaseModel):
    name: str
    mac_address: Optional[str] = None
    ipv4_address: Optional[str] = None
    ipv4_netmask: Optional[str] = None
    ipv6_address: Optional[str] = None
    is_up: bool
    speed: Optional[int] = None  # Mbps
    mtu: Optional[int] = None


class NetworkStats(BaseModel):
    interface: str
    bytes_sent: int
    bytes_recv: int
    packets_sent: int
    packets_recv: int
    errors_in: int
    errors_out: int
    drop_in: int
    drop_out: int


class NetworkStatus(BaseModel):
    hostname: str
    interfaces: list[NetworkInterface]
    stats: list[NetworkStats]
    connections_count: int
    established_connections: int


@router.get("/status", response_model=NetworkStatus)
async def get_network_status():
    """Get comprehensive network status."""
    # Get hostname
    hostname = socket.gethostname()

    # Get network interfaces
    interfaces = []
    addrs = psutil.net_if_addrs()
    stats = psutil.net_if_stats()

    for iface_name, iface_addrs in addrs.items():
        iface_info = NetworkInterface(
            name=iface_name,
            is_up=stats.get(iface_name, {}).isup if iface_name in stats else False,
            speed=stats.get(iface_name, {}).speed if iface_name in stats else None,
            mtu=stats.get(iface_name, {}).mtu if iface_name in stats else None,
        )

        for addr in iface_addrs:
            if addr.family == socket.AF_INET:  # IPv4
                iface_info.ipv4_address = addr.address
                iface_info.ipv4_netmask = addr.netmask
            elif addr.family == socket.AF_INET6:  # IPv6
                if not addr.address.startswith('fe80'):  # Skip link-local
                    iface_info.ipv6_address = addr.address
            elif addr.family == psutil.AF_LINK:  # MAC address
                iface_info.mac_address = addr.address

        interfaces.append(iface_info)

    # Get network I/O stats
    io_stats = []
    net_io = psutil.net_io_counters(pernic=True)
    for iface_name, counters in net_io.items():
        io_stats.append(NetworkStats(
            interface=iface_name,
            bytes_sent=counters.bytes_sent,
            bytes_recv=counters.bytes_recv,
            packets_sent=counters.packets_sent,
            packets_recv=counters.packets_recv,
            errors_in=counters.errin,
            errors_out=counters.errout,
            drop_in=counters.dropin,
            drop_out=counters.dropout,
        ))

    # Get connection counts
    connections = psutil.net_connections(kind='inet')
    established = sum(1 for c in connections if c.status == 'ESTABLISHED')

    return NetworkStatus(
        hostname=hostname,
        interfaces=interfaces,
        stats=io_stats,
        connections_count=len(connections),
        established_connections=established,
    )


@router.get("/connections")
async def get_connections():
    """Get active network connections."""
    connections = []
    for conn in psutil.net_connections(kind='inet'):
        if conn.status == 'ESTABLISHED' or conn.status == 'LISTEN':
            connections.append({
                "local_address": f"{conn.laddr.ip}:{conn.laddr.port}" if conn.laddr else "",
                "remote_address": f"{conn.raddr.ip}:{conn.raddr.port}" if conn.raddr else "",
                "status": conn.status,
                "pid": conn.pid,
            })
    return connections[:100]  # Limit to 100 connections
