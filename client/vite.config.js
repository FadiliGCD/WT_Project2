import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: env.VITE_DEV_API_ORIGIN || 'http://localhost:3000',
          changeOrigin: true,
        },
      },
    },
    define: {
      'process.env.REACT_APP_CLIENT_URL': JSON.stringify(
        env.REACT_APP_CLIENT_URL || ''
      ),
      'process.env.REACT_APP_API_URL': JSON.stringify(env.REACT_APP_API_URL || ''),
    },
  }
})
