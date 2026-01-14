import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 8020,
    strictPort: true,
    host: '0.0.0.0',
    allowedHosts: ['spark.local'],
    proxy: {
      '/api': {
        target: 'http://localhost:8021',
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
