import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Settings, Wifi } from 'lucide-react'
import { Link } from 'react-router-dom'
import { api } from '@/api/client'
import {
  WallpaperBackground,
  Greeting,
  MemoryCard,
  QuickStats,
  AppDock,
  GlassCard,
  WifiDialog,
} from '@/components/dashboard'
import { AppIcon } from '@/components/AppIcon'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  const [wifiDialogOpen, setWifiDialogOpen] = useState(false)
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: api.getSettings,
  })

  const { data: metrics } = useQuery({
    queryKey: ['system-metrics'],
    queryFn: api.getSystemMetrics,
    refetchInterval: 2000,
  })

  const { data: services } = useQuery({
    queryKey: ['services'],
    queryFn: api.getServices,
    refetchInterval: 5000,
  })

  const { data: wallpapers } = useQuery({
    queryKey: ['wallpapers'],
    queryFn: api.getWallpapers,
  })

  const currentWallpaper = wallpapers?.find(
    (w) => w.id === settings?.wallpaper
  )

  return (
    <div className="min-h-screen flex flex-col">
      {/* Wallpaper Background */}
      <WallpaperBackground wallpaperUrl={currentWallpaper?.url} />

      {/* Top Bar */}
      <header className="flex items-center justify-between p-4 relative z-10">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <img src="/spark.svg" alt="Logo" className="h-8 w-8" />
        </div>

        {/* Right side icons */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-white/70 hover:text-white hover:bg-white/10"
            onClick={() => setWifiDialogOpen(true)}
          >
            <Wifi className="h-5 w-5" />
          </Button>
          <Link to="/settings">
            <Button
              variant="ghost"
              size="icon"
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center px-4 md:px-6 pb-24 relative z-10">
        {/* Greeting */}
        <Greeting userName={settings?.user_name || 'User'} />

        {/* Stats Cards */}
        <div className="w-full max-w-3xl space-y-4 mt-4">
          {/* Memory + Quick Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Memory Card */}
            {metrics && (
              <MemoryCard
                used={metrics.memory_used}
                total={metrics.memory_total}
                percent={metrics.memory_percent}
              />
            )}

            {/* Quick Stats */}
            {metrics && (
              <QuickStats
                cpuPercent={metrics.cpu_percent}
                memoryUsed={metrics.memory_used}
                diskUsed={metrics.disk_used}
              />
            )}
          </div>

          {/* GPU Card (if available) */}
          {metrics?.gpu_name && (
            <GlassCard className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-white/60">GPU</p>
                  <p className="text-sm font-medium text-white">
                    {metrics.gpu_name}
                  </p>
                </div>
                <div className="flex gap-6 text-right">
                  <div>
                    <p className="text-xs text-white/60">Utilization</p>
                    <p className="text-sm font-semibold text-white">
                      {metrics.gpu_utilization?.toFixed(0)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-white/60">VRAM</p>
                    <p className="text-sm font-semibold text-white">
                      {metrics.gpu_memory_percent?.toFixed(0)}%
                    </p>
                  </div>
                  {metrics.gpu_temperature && (
                    <div>
                      <p className="text-xs text-white/60">Temp</p>
                      <p className="text-sm font-semibold text-white">
                        {metrics.gpu_temperature}°C
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </GlassCard>
          )}
        </div>

        {/* Applications Section */}
        <div className="w-full max-w-3xl mt-8">
          <p className="text-sm text-white/60 mb-3">Applications</p>
          <GlassCard className="p-6">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
              {services?.map((service) => (
                <AppIcon
                  key={service.name}
                  icon={service.icon}
                  name={service.name}
                  isRunning={service.status === 'running'}
                  onClick={() => {
                    const port = service.frontend_port || service.backend_port
                    if (port && service.status === 'running') {
                      window.open(`http://spark.local:${port}`, '_blank')
                    }
                  }}
                />
              ))}
            </div>
          </GlassCard>
        </div>
      </main>

      {/* Bottom Dock */}
      {services && (
        <AppDock apps={services} pinnedAppNames={settings?.dock_apps} />
      )}

      {/* Wi-Fi Dialog */}
      <WifiDialog open={wifiDialogOpen} onOpenChange={setWifiDialogOpen} />
    </div>
  )
}
