import AppGrid from '@/components/AppGrid'
import SystemMonitor from '@/components/SystemMonitor'

export default function HomePage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to StonePieHome - your Personal AI control center
        </p>
      </div>

      {/* System Monitor */}
      <section>
        <h2 className="text-lg font-semibold mb-4">System Status</h2>
        <SystemMonitor />
      </section>

      {/* Apps */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Applications</h2>
        <AppGrid />
      </section>
    </div>
  )
}
