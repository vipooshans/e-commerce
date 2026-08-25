import { copyFileSync, existsSync } from 'fs'
import { resolve } from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-spa-hosting-files',
      closeBundle() {
        const distDir = resolve(__dirname, 'dist')
        for (const file of ['.htaccess', '_redirects']) {
          const src = resolve(__dirname, 'public', file)
          if (existsSync(src)) copyFileSync(src, resolve(distDir, file))
        }
      },
    },
  ],
  server: {
    port: 5173,
    proxy: {
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  }
})
