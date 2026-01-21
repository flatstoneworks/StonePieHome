import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TooltipProvider } from '@/components/ui/tooltip'
import ErrorBoundary from '@/components/ErrorBoundary'
import Layout from '@/components/Layout'
import HomePage from '@/pages/HomePage'
import SettingsPage from '@/pages/SettingsPage'
import ServicesPage from '@/pages/ServicesPage'
import DockerPage from '@/pages/DockerPage'
import NetworkPage from '@/pages/NetworkPage'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5000,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider delayDuration={300}>
          <BrowserRouter>
            <Routes>
              {/* Dashboard and Settings have their own layout */}
              <Route path="/" element={<HomePage />} />
              <Route path="/settings" element={<SettingsPage />} />

              {/* Other pages use the standard Layout */}
              <Route element={<Layout />}>
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/docker" element={<DockerPage />} />
                <Route path="/network" element={<NetworkPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>
)
