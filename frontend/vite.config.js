import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

// In Docker, VITE_API_URL is set to http://backend:8288 via docker-compose.
// For local dev (start.sh / start.bat), it falls back to localhost.
const apiTarget = process.env.VITE_API_URL || "http://localhost:8288"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5288,
    host: "0.0.0.0",
    proxy: {
      "/api": {
        target: apiTarget,
        changeOrigin: true,
        ws: true,
      },
    },
  },
})
