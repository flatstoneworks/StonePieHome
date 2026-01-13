import { useQuery } from '@tanstack/react-query'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ServiceCard from '@/components/ServiceCard'
import { api } from '@/api/client'

export default function ServicesPage() {
  const {
    data: services,
    isLoading,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['services'],
    queryFn: api.getServices,
    refetchInterval: 5000,
  })

  const runningCount = services?.filter((s) => s.status === 'running').length || 0
  const totalCount = services?.length || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Services</h1>
          <p className="text-muted-foreground">
            Manage your local services and applications
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {runningCount} of {totalCount} running
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

      {/* Services list */}
      {isLoading ? (
        <div className="grid gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-24 rounded-lg border bg-card animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-4">
          {services?.map((service) => (
            <ServiceCard key={service.name} service={service} />
          ))}
        </div>
      )}
    </div>
  )
}
