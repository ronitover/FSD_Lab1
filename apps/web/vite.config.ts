import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rolldownOptions: {
      output: {
        // Libraries every page needs get their own files. They change far less often than the app,
        // so browsers keep them cached across releases. Page-specific libraries (like the map)
        // stay with the pages that use them.
        codeSplitting: {
          groups: [
            {
              name: 'react',
              test: /node_modules[\\/](react|react-dom|scheduler|react-router)[\\/]/,
            },
            { name: 'libs', test: /node_modules[\\/](@supabase|@tanstack|zod)[\\/]/ },
          ],
        },
      },
    },
  },
  optimizeDeps: {
    // Only reached through the lazily loaded mascot, so Vite would otherwise find them mid-session
    // and re-bundle dependencies, which leaves the open page with two copies of React.
    include: ['motion/react', 'motion/react-m'],
  },
  server: {
    // In development the web app calls /api on its own origin and Vite forwards it, so no CORS setup is needed locally.
    proxy: {
      '/api': 'http://localhost:5001',
    },
  },
});
