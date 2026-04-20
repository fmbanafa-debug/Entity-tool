import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Root-level configuration for Vite
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000
  }
})
