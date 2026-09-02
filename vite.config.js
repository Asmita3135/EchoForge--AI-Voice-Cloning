import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    watch: {
      // Exclude node_modules.zip — it is locked by OneDrive sync and
      // causes an EBUSY crash when chokidar tries to watch it.
      ignored: ['**/node_modules.zip'],
    },
  },
})

