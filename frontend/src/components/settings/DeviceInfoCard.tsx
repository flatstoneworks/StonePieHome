import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Server, Globe, Clock, Cpu } from 'lucide-react'

interface DeviceInfoCardProps {
  hostname: string
  os: string
  localIp: string
  uptimeFormatted: string
}

export function DeviceInfoCard({
  hostname,
  os,
  localIp,
  uptimeFormatted,
}: DeviceInfoCardProps) {
  const items = [
    { icon: Server, label: 'Device', value: hostname },
    { icon: Cpu, label: 'OS', value: os },
    { icon: Globe, label: 'Local IP', value: localIp },
    { icon: Clock, label: 'Uptime', value: uptimeFormatted },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Device Info</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <item.icon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{item.label}</span>
            </div>
            <span className="text-sm font-medium">{item.value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
