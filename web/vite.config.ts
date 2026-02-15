import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/monitors': 'http://localhost:8088',
      '/checks': 'http://localhost:8088',
    }
  }
})
