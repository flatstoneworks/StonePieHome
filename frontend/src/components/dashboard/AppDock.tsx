import { GlassCard } from './GlassCard'
import { AppIcon } from '../AppIcon'
import { ServiceInfo } from '@/api/client'

interface AppDockProps {
  apps: ServiceInfo[]
  pinnedAppNames?: string[]
}

export function AppDock({ apps, pinnedAppNames = [] }: AppDockProps) {
  // Show pinned apps if specified, otherwise show running apps
  const dockApps =
    pinnedAppNames.length > 0
      ? apps.filter((app) => pinnedAppNames.includes(app.name))
      : apps.filter((app) => app.status === 'running').slice(0, 6)

  if (dockApps.length === 0) return null

  const handleAppClick = (app: ServiceInfo) => {
    const port = app.frontend_port || app.backend_port
    if (port && app.status === 'running') {
      window.open(`http://spark.local:${port}`, '_blank')
    }
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <GlassCard className="px-4 py-2 flex items-center gap-1" blur="lg">
        {dockApps.map((app) => (
          <AppIcon
            key={app.name}
            icon={app.icon}
            name={app.name}
            isRunning={app.status === 'running'}
            size="sm"
            onClick={() => handleAppClick(app)}
          />
        ))}
      </GlassCard>
    </div>
  )
}
