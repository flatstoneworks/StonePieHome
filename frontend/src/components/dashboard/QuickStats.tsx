import { GlassCard } from './GlassCard'
import { Cpu, MemoryStick, HardDrive } from 'lucide-react'
import { formatBytes, formatPercent } from '@/lib/utils'

interface QuickStatsProps {
  cpuPercent: number
  memoryUsed: number
  diskUsed: number
}

export function QuickStats({ cpuPercent, memoryUsed, diskUsed }: QuickStatsProps) {
  const stats = [
    {
      icon: Cpu,
      label: 'CPU',
      value: formatPercent(cpuPercent),
      color: 'text-blue-400',
    },
    {
      icon: MemoryStick,
      label: 'Memory',
      value: formatBytes(memoryUsed),
      color: 'text-purple-400',
    },
    {
      icon: HardDrive,
      label: 'Storage',
      value: formatBytes(diskUsed),
      color: 'text-amber-400',
    },
  ]

  return (
    <GlassCard className="p-4">
      <div className="flex items-center justify-around">
        {stats.map((stat) => (
          <div key={stat.label} className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-white/5 ${stat.color}`}>
              <stat.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-white/60">{stat.label}</p>
              <p className="text-sm font-semibold text-white">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  )
}
