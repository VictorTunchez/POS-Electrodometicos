import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // el puerto que uses para desarrollo
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // backend local
        changeOrigin: true,
      },
      '/auth': {
        target: 'http://localhost:8080', // para endpoints de auth si los tienes separados
        changeOrigin: true,
      },
    },
  },
});
