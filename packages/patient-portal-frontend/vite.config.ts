import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@lahim/components': path.resolve(__dirname, '../components-lahim/dist/index.esm'),
    },
  },
  server: {
    port: 3002,
    host: true,
    open: true,
  },
  css: {
    preprocessorOptions: {
      scss: {
        includePaths: [
          path.resolve(__dirname, 'node_modules'),
          path.resolve(__dirname, '../../node_modules'),
        ],
      },
    },
  },
  envPrefix: 'VITE_',
})


