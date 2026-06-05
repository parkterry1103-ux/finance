import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react],
  server: {
    proxy: {
      '/api/financials': {
        target: 'https://finance1-flax.vercel.app',
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
