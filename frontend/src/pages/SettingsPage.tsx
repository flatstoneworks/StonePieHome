import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Power, RotateCw, Wifi } from 'lucide-react'
import { Link } from 'react-router-dom'
import { api } from '@/api/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { DeviceInfoCard, WallpaperPicker } from '@/components/settings'
import { WifiDialog } from '@/components/dashboard'
import { formatBytes } from '@/lib/utils'

export default function SettingsPage() {
  const queryClient = useQueryClient()
  const [nameInput, setNameInput] = useState('')
  const [nameInitialized, setNameInitialized] = useState(false)
  const [wifiDialogOpen, setWifiDialogOpen] = useState(false)

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: api.getSettings,
  })

  // Initialize name input when settings load
  if (settings && !nameInitialized) {
    setNameInput(settings.user_name)
    setNameInitialized(true)
  }

  const { data: deviceInfo } = useQuery({
    queryKey: ['device-info'],
    queryFn: api.getDeviceInfo,
  })

  const { data: metrics } = useQuery({
    queryKey: ['system-metrics'],
    queryFn: api.getSystemMetrics,
  })

  const { data: wallpapers } = useQuery({
    queryKey: ['wallpapers'],
    queryFn: api.getWallpapers,
  })

  const { data: wifiStatus } = useQuery({
    queryKey: ['wifi-status'],
    queryFn: api.getWifiStatus,
  })

  const updateSettingsMutation = useMutation({
    mutationFn: api.updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
    },
  })

  const uploadWallpaperMutation = useMutation({
    mutationFn: api.uploadWallpaper,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallpapers'] })
    },
  })

  const restartMutation = useMutation({
    mutationFn: api.restartSystem,
  })

  const shutdownMutation = useMutation({
    mutationFn: api.shutdownSystem,
  })

  const handleNameSave = () => {
    if (settings && nameInput !== settings.user_name) {
      updateSettingsMutation.mutate({ ...settings, user_name: nameInput })
    }
  }

  const handleWallpaperSelect = (wallpaperId: string) => {
    if (settings) {
      updateSettingsMutation.mutate({ ...settings, wallpaper: wallpaperId })
    }
  }

  const handleWallpaperUpload = (file: File) => {
    uploadWallpaperMutation.mutate(file)
  }

  const currentWallpaper = wallpapers?.find((w) => w.id === settings?.wallpaper)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="max-w-4xl mx-auto flex items-center gap-4 p-4">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
        {/* Dashboard Preview */}
        <Card>
          <CardContent className="p-4">
            <div
              className="aspect-video rounded-lg bg-cover bg-center relative overflow-hidden"
              style={{
                backgroundImage: currentWallpaper
                  ? `url(${currentWallpaper.url})`
                  : 'linear-gradient(to br, #1e293b, #581c87, #1e293b)',
              }}
            >
              <div className="absolute inset-0 bg-black/30" />
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-white/60 text-sm">Dashboard Preview</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Device Info + Actions Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Device Info */}
          {deviceInfo && (
            <DeviceInfoCard
              hostname={deviceInfo.hostname}
              os={deviceInfo.os}
              localIp={deviceInfo.local_ip}
              uptimeFormatted={deviceInfo.uptime_formatted}
            />
          )}

          {/* System Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">System Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => restartMutation.mutate()}
                disabled={restartMutation.isPending}
              >
                <RotateCw className="h-4 w-4 mr-2" />
                {restartMutation.isPending ? 'Restarting...' : 'Restart'}
              </Button>
              <Button
                variant="destructive"
                className="w-full justify-start"
                onClick={() => shutdownMutation.mutate()}
                disabled={shutdownMutation.isPending}
              >
                <Power className="h-4 w-4 mr-2" />
                {shutdownMutation.isPending ? 'Shutting down...' : 'Shut down'}
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Note: Actions are currently in UI-only mode.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Storage & Memory */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Storage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {formatBytes(metrics.disk_used)}
                </p>
                <p className="text-sm text-muted-foreground mb-3">
                  of {formatBytes(metrics.disk_total)}
                </p>
                <Progress value={metrics.disk_percent} className="h-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Memory
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {formatBytes(metrics.memory_used)}
                </p>
                <p className="text-sm text-muted-foreground mb-3">
                  of {formatBytes(metrics.memory_total)}
                </p>
                <Progress value={metrics.memory_percent} className="h-2" />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Account Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Display name</Label>
              <div className="flex gap-2">
                <Input
                  id="name"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Enter your name"
                  onBlur={handleNameSave}
                  onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
                />
                <Button
                  onClick={handleNameSave}
                  disabled={
                    updateSettingsMutation.isPending ||
                    nameInput === settings?.user_name
                  }
                >
                  Save
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Wallpaper Selection */}
        {wallpapers && (
          <WallpaperPicker
            wallpapers={wallpapers}
            selectedId={settings?.wallpaper || 'default-1'}
            onSelect={handleWallpaperSelect}
            onUpload={handleWallpaperUpload}
            isUploading={uploadWallpaperMutation.isPending}
          />
        )}

        {/* Placeholder sections */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Wi-Fi</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setWifiDialogOpen(true)}
            >
              View networks
            </Button>
          </CardHeader>
          <CardContent>
            {wifiStatus?.connected ? (
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <Wifi className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{wifiStatus.ssid}</p>
                  <p className="text-sm text-muted-foreground">
                    Connected • Signal: {wifiStatus.signal}%
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Not connected to any network
              </p>
            )}
          </CardContent>
        </Card>

        {/* Wi-Fi Dialog */}
        <WifiDialog open={wifiDialogOpen} onOpenChange={setWifiDialogOpen} />

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Two-factor authentication</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              2FA configuration coming soon...
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
