import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // In development the web app calls /api on its own origin and Vite forwards it, so no CORS setup is needed locally.
    proxy: {
      '/api': 'http://localhost:5001',
    },
  },
});
