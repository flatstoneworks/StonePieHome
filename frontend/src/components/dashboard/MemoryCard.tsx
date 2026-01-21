import { GlassCard } from './GlassCard'
import { Progress } from '@/components/ui/progress'
import { formatBytes } from '@/lib/utils'

interface MemoryCardProps {
  used: number
  total: number
  percent: number
}

export function MemoryCard({ used, total, percent }: MemoryCardProps) {
  const remaining = total - used

  return (
    <GlassCard className="p-6">
      <div className="flex items-start justify-between">
        <div className="space-y-4 flex-1">
          <div className="flex items-center gap-3">
            <span className="text-sm text-white/60">Memory</span>
          </div>

          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white">
                {formatBytes(used)}
              </span>
              <span className="text-sm text-white/50">
                / {formatBytes(total)}
              </span>
            </div>
            <p className="text-sm text-white/60">
              {formatBytes(remaining)} left
            </p>
          </div>

          <Progress
            value={percent}
            className="h-2 bg-white/10 [&>div]:bg-purple-500"
          />
        </div>
      </div>
    </GlassCard>
  )
}
