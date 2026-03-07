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
        // Silence deprecation warnings from Bootstrap 4.x
        // These are coming from Bootstrap's SCSS files and will be fixed when upgrading Bootstrap
        silenceDeprecations: [
          'import',           // @import deprecation
          'global-builtin',   // map-merge() global function
          'color-functions', // darken(), lighten() functions
          'slash-div',        // Division operator /
          'if-function',      // if() function syntax deprecation
        ],
        // Use legacy API for better compatibility with Bootstrap 4
        api: 'legacy',
        // Suppress warnings from dependencies (Bootstrap)
        quietDeps: true,
      },
    },
  },
  envPrefix: 'VITE_',
})


