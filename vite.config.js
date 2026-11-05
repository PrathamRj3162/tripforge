import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { createApiMiddleware } from './scripts/dev-api.mjs'

// Dev only: serves the files in /api on the same port as the React app, so
// `npm run dev` is the only command you need (no Vercel CLI login).
// In production Vercel runs the very same files as serverless functions.
function devApi(mode) {
  return {
    name: 'dev-api',
    apply: 'serve',
    configureServer(server) {
      // Make server-only variables (no VITE_ prefix) from .env.local visible to the handlers.
      const env = loadEnv(mode, process.cwd(), '')
      for (const [key, value] of Object.entries(env)) {
        if (process.env[key] === undefined) process.env[key] = value
      }
      const apiDir = fileURLToPath(new URL('./api', import.meta.url))
      server.middlewares.use(createApiMiddleware({ apiDir }))
    },
  }
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), devApi(mode)],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
}))
