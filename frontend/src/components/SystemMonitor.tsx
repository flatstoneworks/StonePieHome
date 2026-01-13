import { useQuery } from '@tanstack/react-query'
import { Cpu, HardDrive, MemoryStick, Thermometer, Monitor } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { api } from '@/api/client'
import { formatBytes, formatPercent } from '@/lib/utils'

function MetricCard({
  icon: Icon,
  title,
  value,
  subValue,
  percent,
  color = 'primary',
}: {
  icon: React.ElementType
  title: string
  value: string
  subValue?: string
  percent?: number
  color?: 'primary' | 'green' | 'amber' | 'red'
}) {
  const colorClasses = {
    primary: 'text-primary',
    green: 'text-green-500',
    amber: 'text-amber-500',
    red: 'text-red-500',
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${colorClasses[color]}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subValue && (
          <p className="text-xs text-muted-foreground">{subValue}</p>
        )}
        {percent !== undefined && (
          <Progress value={percent} className="mt-2 h-1" />
        )}
      </CardContent>
    </Card>
  )
}

export default function SystemMonitor() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['system-metrics'],
    queryFn: api.getSystemMetrics,
    refetchInterval: 2000,
  })

  if (isLoading || !metrics) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="h-32 animate-pulse bg-card" />
        ))}
      </div>
    )
  }

  const cpuColor = metrics.cpu_percent > 80 ? 'red' : metrics.cpu_percent > 50 ? 'amber' : 'green'
  const memColor = metrics.memory_percent > 80 ? 'red' : metrics.memory_percent > 50 ? 'amber' : 'green'
  const diskColor = metrics.disk_percent > 80 ? 'red' : metrics.disk_percent > 50 ? 'amber' : 'green'

  return (
    <div className="space-y-4">
      {/* Main metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          icon={Cpu}
          title="CPU"
          value={formatPercent(metrics.cpu_percent)}
          subValue={`${metrics.cpu_count} cores`}
          percent={metrics.cpu_percent}
          color={cpuColor}
        />
        <MetricCard
          icon={MemoryStick}
          title="Memory"
          value={formatBytes(metrics.memory_used)}
          subValue={`of ${formatBytes(metrics.memory_total)}`}
          percent={metrics.memory_percent}
          color={memColor}
        />
        <MetricCard
          icon={HardDrive}
          title="Storage"
          value={formatBytes(metrics.disk_used)}
          subValue={`of ${formatBytes(metrics.disk_total)}`}
          percent={metrics.disk_percent}
          color={diskColor}
        />
        {metrics.cpu_temperature && (
          <MetricCard
            icon={Thermometer}
            title="CPU Temp"
            value={`${metrics.cpu_temperature.toFixed(0)}°C`}
            color={metrics.cpu_temperature > 80 ? 'red' : metrics.cpu_temperature > 60 ? 'amber' : 'green'}
          />
        )}
      </div>

      {/* GPU metrics if available */}
      {metrics.gpu_name && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Monitor className="h-4 w-4 text-primary" />
              {metrics.gpu_name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Utilization</p>
                <p className="text-lg font-semibold">
                  {metrics.gpu_utilization !== undefined
                    ? formatPercent(metrics.gpu_utilization)
                    : 'N/A'}
                </p>
                {metrics.gpu_utilization !== undefined && (
                  <Progress value={metrics.gpu_utilization} className="mt-1 h-1" />
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground">VRAM</p>
                <p className="text-lg font-semibold">
                  {metrics.gpu_memory_used !== undefined
                    ? formatBytes(metrics.gpu_memory_used)
                    : 'N/A'}
                </p>
                {metrics.gpu_memory_percent !== undefined && (
                  <Progress value={metrics.gpu_memory_percent} className="mt-1 h-1" />
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground">VRAM Total</p>
                <p className="text-lg font-semibold">
                  {metrics.gpu_memory_total !== undefined
                    ? formatBytes(metrics.gpu_memory_total)
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">GPU Temp</p>
                <p className="text-lg font-semibold">
                  {metrics.gpu_temperature !== undefined
                    ? `${metrics.gpu_temperature}°C`
                    : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
