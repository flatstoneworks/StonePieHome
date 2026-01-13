import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Folder,
  Image,
  MessageSquare,
  Sparkles,
  Play,
  Square,
  RotateCw,
  FileText,
  MoreVertical,
  ExternalLink,
  Loader2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { api, ServiceInfo } from '@/api/client'
import { cn } from '@/lib/utils'

const iconMap: Record<string, React.ReactNode> = {
  folder: <Folder className="h-5 w-5" />,
  image: <Image className="h-5 w-5" />,
  'message-square': <MessageSquare className="h-5 w-5" />,
  sparkles: <Sparkles className="h-5 w-5" />,
}

const colorMap: Record<string, string> = {
  folder: 'text-amber-500',
  image: 'text-pink-500',
  'message-square': 'text-blue-500',
  sparkles: 'text-purple-500',
}

interface ServiceCardProps {
  service: ServiceInfo
}

export default function ServiceCard({ service }: ServiceCardProps) {
  const [showLogs, setShowLogs] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const queryClient = useQueryClient()

  const isRunning = service.status === 'running'
  const port = service.frontend_port || service.backend_port
  const url = port ? `http://spark.local:${port}` : null

  const startMutation = useMutation({
    mutationFn: () => api.startService(service.name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
    },
  })

  const stopMutation = useMutation({
    mutationFn: () => api.stopService(service.name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
    },
  })

  const restartMutation = useMutation({
    mutationFn: () => api.restartService(service.name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
    },
  })

  const isLoading =
    startMutation.isPending ||
    stopMutation.isPending ||
    restartMutation.isPending

  const handleViewLogs = async () => {
    try {
      const response = await api.getServiceLogs(service.name)
      setLogs(response.logs)
      setShowLogs(true)
    } catch (error) {
      console.error('Failed to fetch logs:', error)
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-lg bg-secondary',
                colorMap[service.icon]
              )}
            >
              {iconMap[service.icon] || <Folder className="h-5 w-5" />}
            </div>
            <div>
              <CardTitle className="text-base">{service.name}</CardTitle>
              <p className="text-xs text-muted-foreground">
                {service.description}
              </p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {url && isRunning && (
                <>
                  <DropdownMenuItem onClick={() => window.open(url, '_blank')}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open in Browser
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem onClick={handleViewLogs}>
                <FileText className="mr-2 h-4 w-4" />
                View Logs
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>

        <CardContent>
          <div className="flex items-center justify-between">
            {/* Status and ports */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    'h-2 w-2 rounded-full',
                    isRunning ? 'bg-green-500' : 'bg-muted-foreground'
                  )}
                />
                <span className="text-sm">
                  {isRunning ? 'Running' : 'Stopped'}
                </span>
              </div>

              {service.frontend_port && (
                <span className="text-xs text-muted-foreground">
                  Frontend: {service.frontend_port}
                </span>
              )}
              {service.backend_port && (
                <span className="text-xs text-muted-foreground">
                  Backend: {service.backend_port}
                </span>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1">
              {isRunning ? (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => stopMutation.mutate()}
                        disabled={isLoading}
                      >
                        {stopMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Stop</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => restartMutation.mutate()}
                        disabled={isLoading}
                      >
                        {restartMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <RotateCw className="h-4 w-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Restart</TooltipContent>
                  </Tooltip>
                </>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-green-500 hover:text-green-400"
                      onClick={() => startMutation.mutate()}
                      disabled={isLoading}
                    >
                      {startMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Start</TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Dialog */}
      <Dialog open={showLogs} onOpenChange={setShowLogs}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{service.name} - Logs</DialogTitle>
          </DialogHeader>
          <div className="bg-secondary rounded-md p-4 overflow-auto max-h-[60vh] scrollbar-thin">
            <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap">
              {logs.length > 0 ? logs.join('\n') : 'No logs available'}
            </pre>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
