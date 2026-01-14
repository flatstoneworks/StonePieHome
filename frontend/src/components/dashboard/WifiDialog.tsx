import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Wifi, WifiOff, Signal, Lock, RefreshCw, Check } from 'lucide-react'
import { api, WifiNetwork } from '@/api/client'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface WifiDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function SignalIcon({ strength }: { strength: number }) {
  // Map signal strength to icon opacity/bars
  const bars = strength > 75 ? 4 : strength > 50 ? 3 : strength > 25 ? 2 : 1

  return (
    <div className="flex items-end gap-0.5 h-4">
      {[1, 2, 3, 4].map((bar) => (
        <div
          key={bar}
          className={cn(
            'w-1 rounded-sm transition-colors',
            bar <= bars ? 'bg-foreground' : 'bg-muted',
            bar === 1 && 'h-1',
            bar === 2 && 'h-2',
            bar === 3 && 'h-3',
            bar === 4 && 'h-4'
          )}
        />
      ))}
    </div>
  )
}

function NetworkItem({
  network,
  isConnected,
}: {
  network: WifiNetwork
  isConnected: boolean
}) {
  const hasPassword = network.security !== 'Open' && network.security !== ''

  return (
    <div
      className={cn(
        'flex items-center justify-between p-3 rounded-lg transition-colors',
        isConnected ? 'bg-primary/10' : 'hover:bg-muted/50'
      )}
    >
      <div className="flex items-center gap-3">
        <Wifi
          className={cn(
            'h-5 w-5',
            isConnected ? 'text-primary' : 'text-muted-foreground'
          )}
        />
        <div>
          <p
            className={cn(
              'font-medium',
              isConnected && 'text-primary'
            )}
          >
            {network.ssid}
          </p>
          <p className="text-xs text-muted-foreground">
            {hasPassword ? network.security : 'Open'}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {isConnected && (
          <Check className="h-4 w-4 text-primary" />
        )}
        {hasPassword && (
          <Lock className="h-3 w-3 text-muted-foreground" />
        )}
        <SignalIcon strength={network.signal} />
      </div>
    </div>
  )
}

export function WifiDialog({ open, onOpenChange }: WifiDialogProps) {
  const queryClient = useQueryClient()

  const { data: wifiInfo, isLoading } = useQuery({
    queryKey: ['wifi-info'],
    queryFn: api.getWifiInfo,
    refetchInterval: open ? 5000 : false, // Refresh every 5s when open
    enabled: open,
  })

  const scanMutation = useMutation({
    mutationFn: api.scanWifiNetworks,
    onSuccess: () => {
      // Refetch after scan
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['wifi-info'] })
      }, 2000)
    },
  })

  const status = wifiInfo?.status
  const networks = wifiInfo?.networks || []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5" />
            Wi-Fi
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Connection Status */}
          <div className="p-4 rounded-lg bg-muted/30 border">
            {status?.connected ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Wifi className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{status.ssid}</p>
                    <p className="text-sm text-muted-foreground">
                      Connected • Signal: {status.signal}%
                    </p>
                  </div>
                </div>
                <SignalIcon strength={status.signal || 0} />
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-muted">
                  <WifiOff className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">Not Connected</p>
                  <p className="text-sm text-muted-foreground">
                    Select a network below
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Available Networks */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">
                Available Networks
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => scanMutation.mutate()}
                disabled={scanMutation.isPending}
              >
                <RefreshCw
                  className={cn(
                    'h-4 w-4 mr-1',
                    scanMutation.isPending && 'animate-spin'
                  )}
                />
                Scan
              </Button>
            </div>

            <div className="space-y-1 max-h-64 overflow-y-auto">
              {isLoading ? (
                <div className="py-8 text-center text-muted-foreground">
                  <RefreshCw className="h-6 w-6 mx-auto mb-2 animate-spin" />
                  <p>Scanning networks...</p>
                </div>
              ) : networks.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <WifiOff className="h-6 w-6 mx-auto mb-2" />
                  <p>No networks found</p>
                </div>
              ) : (
                networks.map((network) => (
                  <NetworkItem
                    key={network.ssid}
                    network={network}
                    isConnected={network.in_use}
                  />
                ))
              )}
            </div>
          </div>

          {/* Note */}
          <p className="text-xs text-muted-foreground text-center">
            Network connection management coming soon
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
