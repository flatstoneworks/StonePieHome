import { useQuery } from '@tanstack/react-query'
import {
  Folder,
  Image,
  MessageSquare,
  Sparkles,
  ExternalLink,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { api, ServiceInfo } from '@/api/client'
import { cn } from '@/lib/utils'

const iconMap: Record<string, React.ReactNode> = {
  folder: <Folder className="h-8 w-8" />,
  image: <Image className="h-8 w-8" />,
  'message-square': <MessageSquare className="h-8 w-8" />,
  sparkles: <Sparkles className="h-8 w-8" />,
}

const colorMap: Record<string, string> = {
  folder: 'text-amber-500',
  image: 'text-pink-500',
  'message-square': 'text-blue-500',
  sparkles: 'text-purple-500',
}

interface AppCardProps {
  service: ServiceInfo
}

function AppCard({ service }: AppCardProps) {
  const isRunning = service.status === 'running'
  const port = service.frontend_port || service.backend_port
  const url = port ? `http://spark.local:${port}` : null

  const handleClick = () => {
    if (url && isRunning) {
      window.open(url, '_blank')
    }
  }

  return (
    <Card
      className={cn(
        'group relative flex flex-col items-center p-6 transition-all',
        isRunning
          ? 'cursor-pointer hover:bg-accent/50 hover:border-primary/50'
          : 'opacity-60'
      )}
      onClick={handleClick}
    >
      {/* Status indicator */}
      <div
        className={cn(
          'absolute top-3 right-3 h-2 w-2 rounded-full',
          isRunning ? 'bg-green-500' : 'bg-muted-foreground'
        )}
      />

      {/* Icon */}
      <div className={cn('mb-4', colorMap[service.icon] || 'text-muted-foreground')}>
        {iconMap[service.icon] || <Folder className="h-8 w-8" />}
      </div>

      {/* Name */}
      <h3 className="text-base font-semibold mb-1">{service.name}</h3>

      {/* Description */}
      <p className="text-xs text-muted-foreground text-center mb-2">
        {service.description}
      </p>

      {/* Port */}
      {port && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <span>:{port}</span>
          {isRunning && (
            <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </div>
      )}
    </Card>
  )
}

export default function AppGrid() {
  const { data: services, isLoading } = useQuery({
    queryKey: ['services'],
    queryFn: api.getServices,
    refetchInterval: 5000,
  })

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="h-40 animate-pulse bg-card" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {services?.map((service) => (
        <AppCard key={service.name} service={service} />
      ))}
    </div>
  )
}
