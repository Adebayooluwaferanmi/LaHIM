import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'LahimComponents',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'esm' : 'js'}`,
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react-bootstrap', 'bootstrap', 'react-spinners', 'react-toastify', 'react-datepicker', 'date-fns', '@fortawesome/fontawesome-svg-core', '@fortawesome/react-fontawesome', '@fullcalendar/core', '@fullcalendar/react', '@fullcalendar/daygrid', '@fullcalendar/timegrid', '@fullcalendar/interaction'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react-bootstrap': 'ReactBootstrap',
          bootstrap: 'Bootstrap',
        },
        // Ensure named exports are preserved
        exports: 'named',
      },
    },
    cssCodeSplit: false,
    sourcemap: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})

