import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Skickar alla anrop som börjar med /api till din backend
      '/api': {
        target: 'http://localhost:5000', // Din backend-server
        changeOrigin: true,
      },
      // Skickar WebSocket-anslutningar till din backend
      '/ws': {
        target: 'ws://localhost:5000',
        ws: true,
      },
    }
  }
})