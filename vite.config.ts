import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
<<<<<<< HEAD
      '/api': 'http://localhost:10000' // Use local backend for /api
=======
      '/api': 'https://mini-crm-iq49.onrender.com' // Use Render backend for /api
>>>>>>> c78d50ad0cebdcf52d2faa90bb169ec5abf965a0
    }
  },
})
