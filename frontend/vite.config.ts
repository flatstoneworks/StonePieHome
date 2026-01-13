import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 8888,
    strictPort: true,
    host: '0.0.0.0',
    allowedHosts: ['spark.local'],
    proxy: {
      '/api': {
        target: 'http://localhost:8889',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
