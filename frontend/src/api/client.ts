const BASE_URL = '/api'

export interface SystemMetrics {
  cpu_percent: number
  cpu_per_core: number[]
  cpu_count: number
  memory_total: number
  memory_used: number
  memory_percent: number
  disk_total: number
  disk_used: number
  disk_percent: number
  gpu_name?: string
  gpu_memory_total?: number
  gpu_memory_used?: number
  gpu_memory_percent?: number
  gpu_utilization?: number
  gpu_temperature?: number
  cpu_temperature?: number
}

export type ServiceStatus = 'running' | 'stopped' | 'error' | 'unknown'

export interface ServiceInfo {
  name: string
  description: string
  icon: string
  path: string
  frontend_port?: number
  backend_port?: number
  websocket_port?: number
  status: ServiceStatus
  frontend_running: boolean
  backend_running: boolean
}

export interface ServiceActionResponse {
  success: boolean
  message: string
}

export interface LogsResponse {
  logs: string[]
  service: string
}

// Docker types
export interface ContainerInfo {
  id: string
  name: string
  image: string
  status: string
  state: string
  ports: string[]
  created: string
}

export interface ContainerStats {
  id: string
  name: string
  cpu_percent: number
  memory_usage: string
  memory_limit: string
  memory_percent: number
  network_io: string
  block_io: string
}

export interface DockerInfo {
  containers: number
  containers_running: number
  containers_paused: number
  containers_stopped: number
  images: number
  server_version: string
  storage_driver: string
  memory_total: number
  cpus: number
}

// Network types
export interface NetworkInterface {
  name: string
  mac_address?: string
  ipv4_address?: string
  ipv4_netmask?: string
  ipv6_address?: string
  is_up: boolean
  speed?: number
  mtu?: number
}

export interface NetworkStats {
  interface: string
  bytes_sent: number
  bytes_recv: number
  packets_sent: number
  packets_recv: number
  errors_in: number
  errors_out: number
  drop_in: number
  drop_out: number
}

export interface NetworkStatus {
  hostname: string
  interfaces: NetworkInterface[]
  stats: NetworkStats[]
  connections_count: number
  established_connections: number
}

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options)
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }))
    throw new Error(error.detail || 'Request failed')
  }
  return response.json()
}

export const api = {
  getSystemMetrics: () => fetchJson<SystemMetrics>(`${BASE_URL}/system`),

  getServices: () => fetchJson<ServiceInfo[]>(`${BASE_URL}/services`),

  startService: (name: string) =>
    fetchJson<ServiceActionResponse>(`${BASE_URL}/services/${name}/start`, {
      method: 'POST',
    }),

  stopService: (name: string) =>
    fetchJson<ServiceActionResponse>(`${BASE_URL}/services/${name}/stop`, {
      method: 'POST',
    }),

  restartService: (name: string) =>
    fetchJson<ServiceActionResponse>(`${BASE_URL}/services/${name}/restart`, {
      method: 'POST',
    }),

  getServiceLogs: (name: string, lines = 100) =>
    fetchJson<LogsResponse>(`${BASE_URL}/services/${name}/logs?lines=${lines}`),

  // Docker endpoints
  getDockerInfo: () => fetchJson<DockerInfo>(`${BASE_URL}/docker/info`),

  getContainers: (all = true) =>
    fetchJson<ContainerInfo[]>(`${BASE_URL}/docker/containers?all=${all}`),

  getContainerStats: (id: string) =>
    fetchJson<ContainerStats>(`${BASE_URL}/docker/containers/${id}/stats`),

  startContainer: (id: string) =>
    fetchJson<ServiceActionResponse>(`${BASE_URL}/docker/containers/${id}/start`, {
      method: 'POST',
    }),

  stopContainer: (id: string) =>
    fetchJson<ServiceActionResponse>(`${BASE_URL}/docker/containers/${id}/stop`, {
      method: 'POST',
    }),

  restartContainer: (id: string) =>
    fetchJson<ServiceActionResponse>(`${BASE_URL}/docker/containers/${id}/restart`, {
      method: 'POST',
    }),

  getContainerLogs: (id: string, lines = 100) =>
    fetchJson<{ logs: string[]; container: string }>(
      `${BASE_URL}/docker/containers/${id}/logs?lines=${lines}`
    ),

  // Network endpoints
  getNetworkStatus: () => fetchJson<NetworkStatus>(`${BASE_URL}/network/status`),
}
