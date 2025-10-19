import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3347,
    proxy: {
      '/api': {
        target: 'http://localhost:3346',
        changeOrigin: true
      }
    }
  }
})

