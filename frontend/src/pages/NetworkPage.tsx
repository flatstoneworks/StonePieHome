import { useQuery } from '@tanstack/react-query'
import {
  Network,
  Wifi,
  WifiOff,
  Globe,
  ArrowUpDown,
  RefreshCw,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { api, NetworkInterface, NetworkStats } from '@/api/client'
import { formatBytes, cn } from '@/lib/utils'

function InterfaceCard({
  iface,
  stats,
}: {
  iface: NetworkInterface
  stats?: NetworkStats
}) {
  const isEthernet = iface.name.startsWith('eth') || iface.name.startsWith('en')
  const isWifi = iface.name.startsWith('wl')
  const isLoopback = iface.name === 'lo'
  const isDocker = iface.name.startsWith('docker') || iface.name.startsWith('br-')
  const isVeth = iface.name.startsWith('veth')

  // Skip virtual interfaces by default
  if (isVeth) return null

  const Icon = iface.is_up ? (isWifi ? Wifi : Network) : WifiOff

  return (
    <Card className={cn(!iface.is_up && 'opacity-60')}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-lg bg-secondary',
              iface.is_up ? 'text-green-500' : 'text-muted-foreground'
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-base font-mono">{iface.name}</CardTitle>
            <p className="text-xs text-muted-foreground">
              {isLoopback
                ? 'Loopback'
                : isDocker
                  ? 'Docker Network'
                  : isWifi
                    ? 'Wireless'
                    : isEthernet
                      ? 'Ethernet'
                      : 'Network Interface'}
            </p>
          </div>
        </div>
        <div
          className={cn(
            'h-2 w-2 rounded-full',
            iface.is_up ? 'bg-green-500' : 'bg-muted-foreground'
          )}
        />
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {iface.ipv4_address && (
            <div>
              <p className="text-muted-foreground text-xs">IPv4</p>
              <p className="font-mono">{iface.ipv4_address}</p>
            </div>
          )}
          {iface.mac_address && (
            <div>
              <p className="text-muted-foreground text-xs">MAC</p>
              <p className="font-mono text-xs">{iface.mac_address}</p>
            </div>
          )}
          {iface.speed && iface.speed > 0 && (
            <div>
              <p className="text-muted-foreground text-xs">Speed</p>
              <p>{iface.speed >= 1000 ? `${iface.speed / 1000} Gbps` : `${iface.speed} Mbps`}</p>
            </div>
          )}
          {iface.mtu && (
            <div>
              <p className="text-muted-foreground text-xs">MTU</p>
              <p>{iface.mtu}</p>
            </div>
          )}
        </div>

        {stats && (
          <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground text-xs flex items-center gap-1">
                <ArrowUpDown className="h-3 w-3" /> Received
              </p>
              <p className="font-semibold">{formatBytes(stats.bytes_recv)}</p>
              <p className="text-xs text-muted-foreground">
                {stats.packets_recv.toLocaleString()} packets
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs flex items-center gap-1">
                <ArrowUpDown className="h-3 w-3" /> Sent
              </p>
              <p className="font-semibold">{formatBytes(stats.bytes_sent)}</p>
              <p className="text-xs text-muted-foreground">
                {stats.packets_sent.toLocaleString()} packets
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function NetworkPage() {
  const {
    data: networkStatus,
    isLoading,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['network-status'],
    queryFn: api.getNetworkStatus,
    refetchInterval: 5000,
  })

  const activeInterfaces =
    networkStatus?.interfaces.filter((i) => i.is_up && i.ipv4_address).length || 0

  // Create a map of stats by interface name
  const statsMap = new Map(
    networkStatus?.stats.map((s) => [s.interface, s]) || []
  )

  // Sort interfaces: active first, then by name
  const sortedInterfaces = [...(networkStatus?.interfaces || [])].sort((a, b) => {
    if (a.is_up !== b.is_up) return a.is_up ? -1 : 1
    if (a.ipv4_address && !b.ipv4_address) return -1
    if (!a.ipv4_address && b.ipv4_address) return 1
    return a.name.localeCompare(b.name)
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Network Status</h1>
          <p className="text-muted-foreground">
            Monitor network interfaces and connectivity
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`}
          />
          Refresh
        </Button>
      </div>

      {/* Overview */}
      {networkStatus && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">Hostname</span>
              </div>
              <p className="text-lg font-semibold mt-1 font-mono">
                {networkStatus.hostname}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Network className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">Interfaces</span>
              </div>
              <p className="text-2xl font-bold mt-1">
                {activeInterfaces}{' '}
                <span className="text-sm font-normal text-muted-foreground">
                  / {networkStatus.interfaces.length}
                </span>
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">Connections</span>
              </div>
              <p className="text-2xl font-bold mt-1">
                {networkStatus.connections_count}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-sm text-muted-foreground">Established</span>
              </div>
              <p className="text-2xl font-bold mt-1">
                {networkStatus.established_connections}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Interfaces */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Network Interfaces</h2>
        {isLoading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-32 rounded-lg border bg-card animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-4">
            {sortedInterfaces.map((iface) => (
              <InterfaceCard
                key={iface.name}
                iface={iface}
                stats={statsMap.get(iface.name)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
