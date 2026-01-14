import { cn } from '@/lib/utils'
import {
  Folder,
  Image,
  MessageSquare,
  Sparkles,
  Box,
  Settings,
  Home,
  LucideIcon,
} from 'lucide-react'

const iconMap: Record<string, LucideIcon> = {
  folder: Folder,
  image: Image,
  'message-square': MessageSquare,
  sparkles: Sparkles,
  box: Box,
  settings: Settings,
  home: Home,
}

const gradientMap: Record<string, string> = {
  folder: 'from-amber-500 to-orange-600',
  image: 'from-pink-500 to-rose-600',
  'message-square': 'from-blue-500 to-indigo-600',
  sparkles: 'from-purple-500 to-violet-600',
  box: 'from-emerald-500 to-teal-600',
  settings: 'from-slate-500 to-slate-700',
  home: 'from-cyan-500 to-blue-600',
}

interface AppIconProps {
  icon: string
  name: string
  isRunning?: boolean
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
}

export function AppIcon({
  icon,
  name,
  isRunning = true,
  size = 'md',
  onClick,
}: AppIconProps) {
  const Icon = iconMap[icon] || Box
  const gradient = gradientMap[icon] || 'from-gray-500 to-gray-600'

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
  }

  const iconSizes = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
  }

  return (
    <button
      onClick={onClick}
      disabled={!isRunning}
      className={cn(
        'group flex flex-col items-center gap-2 p-3 rounded-2xl transition-all',
        'hover:bg-white/10 active:scale-95',
        !isRunning && 'opacity-50 cursor-not-allowed'
      )}
    >
      <div className="relative">
        <div
          className={cn(
            'rounded-2xl bg-gradient-to-br shadow-lg flex items-center justify-center',
            'transition-transform group-hover:scale-105',
            gradient,
            sizeClasses[size]
          )}
        >
          <Icon className={cn('text-white', iconSizes[size])} />
        </div>
        {isRunning !== undefined && (
          <div
            className={cn(
              'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-black/50',
              isRunning ? 'bg-green-500' : 'bg-gray-500'
            )}
          />
        )}
      </div>
      <span className="text-xs text-white/80 font-medium truncate max-w-[80px] text-center">
        {name}
      </span>
    </button>
  )
}
