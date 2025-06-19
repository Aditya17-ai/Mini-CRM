import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Change the target below depending on your environment (local or production)
      // '/api': 'http://localhost:10000', // Use this for local development
      '/api': 'https://mini-crm-xss1.onrender.com' // Uncommented for production
    }
  },
})
