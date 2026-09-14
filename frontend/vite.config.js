import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      },
      manifest: {
        name: 'Portal Contábil OSCs',
        short_name: 'Portal OSCs',
        description: 'Portal Contábil para OSCs',
        theme_color: '#ea580c',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'logo_portal.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'logo_portal.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 5242880 // 5MB limit
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
})
