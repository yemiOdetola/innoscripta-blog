import path from 'path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true, // Needed for Docker
    strictPort: true,
    port: 5173,
    watch: {
      usePolling: true
    }
  },
  envPrefix: 'VITE_',  // Only expose env variables that start with VITE_
  define: {
    'process.env.VITE_GUARDIAN_API_KEY': JSON.stringify(process.env.VITE_GUARDIAN_API_KEY),
    'process.env.VITE_NYT_API_KEY': JSON.stringify(process.env.VITE_NYT_API_KEY),
    'process.env.VITE_NEWS_API_KEY': JSON.stringify(process.env.VITE_NEWS_API_KEY)
  }
})
