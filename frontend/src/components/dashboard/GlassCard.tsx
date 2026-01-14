import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface GlassCardProps {
  children: ReactNode
  className?: string
  blur?: 'sm' | 'md' | 'lg'
}

export function GlassCard({ children, className, blur = 'md' }: GlassCardProps) {
  const blurMap = {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg',
  }

  return (
    <div
      className={cn(
        'rounded-2xl border border-white/10',
        'bg-white/5',
        blurMap[blur],
        'shadow-lg shadow-black/10',
        className
      )}
    >
      {children}
    </div>
  )
}
