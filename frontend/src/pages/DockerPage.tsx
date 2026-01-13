import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Box,
  Play,
  Square,
  RotateCw,
  FileText,
  RefreshCw,
  Loader2,
  Container,
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
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { api, ContainerInfo } from '@/api/client'
import { cn } from '@/lib/utils'

function ContainerCard({ container }: { container: ContainerInfo }) {
  const [showLogs, setShowLogs] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const queryClient = useQueryClient()

  const isRunning = container.state === 'running'

  const startMutation = useMutation({
    mutationFn: () => api.startContainer(container.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['containers'] })
    },
  })

  const stopMutation = useMutation({
    mutationFn: () => api.stopContainer(container.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['containers'] })
    },
  })

  const restartMutation = useMutation({
    mutationFn: () => api.restartContainer(container.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['containers'] })
    },
  })

  const isLoading =
    startMutation.isPending ||
    stopMutation.isPending ||
    restartMutation.isPending

  const handleViewLogs = async () => {
    try {
      const response = await api.getContainerLogs(container.id)
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
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-blue-500">
              <Box className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base">{container.name}</CardTitle>
              <p className="text-xs text-muted-foreground font-mono">
                {container.image}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    'h-2 w-2 rounded-full',
                    isRunning ? 'bg-green-500' : 'bg-muted-foreground'
                  )}
                />
                <span className="text-sm capitalize">{container.state}</span>
              </div>

              <span className="text-xs text-muted-foreground">
                {container.status}
              </span>

              {container.ports.length > 0 && container.ports[0] && (
                <span className="text-xs text-muted-foreground font-mono">
                  {container.ports.slice(0, 2).join(', ')}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleViewLogs}
                  >
                    <FileText className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>View Logs</TooltipContent>
              </Tooltip>

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

      <Dialog open={showLogs} onOpenChange={setShowLogs}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{container.name} - Logs</DialogTitle>
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

export default function DockerPage() {
  const {
    data: containers,
    isLoading: containersLoading,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['containers'],
    queryFn: () => api.getContainers(true),
    refetchInterval: 5000,
  })

  const { data: dockerInfo } = useQuery({
    queryKey: ['docker-info'],
    queryFn: api.getDockerInfo,
    refetchInterval: 10000,
  })

  const runningCount = containers?.filter((c) => c.state === 'running').length || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Docker Containers</h1>
          <p className="text-muted-foreground">
            Manage Docker containers on your system
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {runningCount} of {containers?.length || 0} running
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Docker Info */}
      {dockerInfo && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Container className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">Containers</span>
              </div>
              <p className="text-2xl font-bold mt-1">{dockerInfo.containers}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-sm text-muted-foreground">Running</span>
              </div>
              <p className="text-2xl font-bold mt-1">{dockerInfo.containers_running}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                <span className="text-sm text-muted-foreground">Stopped</span>
              </div>
              <p className="text-2xl font-bold mt-1">{dockerInfo.containers_stopped}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Box className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">Images</span>
              </div>
              <p className="text-2xl font-bold mt-1">{dockerInfo.images}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-sm text-muted-foreground">Docker Version</div>
              <p className="text-lg font-semibold mt-1">{dockerInfo.server_version}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Docker not available message */}
      {!containersLoading && !dockerInfo && (
        <Card>
          <CardContent className="py-8 text-center">
            <Box className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-2">
              Docker is not available or requires permissions
            </p>
            <p className="text-sm text-muted-foreground">
              Add your user to the docker group: <code className="bg-secondary px-2 py-1 rounded">sudo usermod -aG docker $USER</code>
            </p>
          </CardContent>
        </Card>
      )}

      {/* Containers list */}
      {dockerInfo && (containersLoading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 rounded-lg border bg-card animate-pulse"
            />
          ))}
        </div>
      ) : containers && containers.length > 0 ? (
        <div className="grid gap-4">
          {containers.map((container) => (
            <ContainerCard key={container.id} container={container} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No Docker containers found
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
