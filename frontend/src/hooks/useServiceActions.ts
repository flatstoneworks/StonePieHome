import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/client'

/**
 * Custom hook for service lifecycle actions (start, stop, restart).
 * Automatically invalidates the services query on success.
 */
export function useServiceActions(serviceName: string) {
  const queryClient = useQueryClient()

  const startMutation = useMutation({
    mutationFn: () => api.startService(serviceName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
    },
  })

  const stopMutation = useMutation({
    mutationFn: () => api.stopService(serviceName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
    },
  })

  const restartMutation = useMutation({
    mutationFn: () => api.restartService(serviceName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
    },
  })

  const isLoading =
    startMutation.isPending ||
    stopMutation.isPending ||
    restartMutation.isPending

  return {
    start: startMutation,
    stop: stopMutation,
    restart: restartMutation,
    isLoading,
  }
}
