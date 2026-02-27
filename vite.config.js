import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/TypeSet/',
  plugins: [react()],
  optimizeDeps: {
    entries: ['index.html'],
  },
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
      },
    },
  },
});
