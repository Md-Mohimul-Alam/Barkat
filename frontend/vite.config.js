import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5050',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Split big dependencies into separate chunks
            if (id.includes('html2canvas')) {
              return 'html2canvas';
            }
            return 'vendor';
          }
        }
      }
    },
    chunkSizeWarningLimit: 1000 // Increase limit if needed
  }
});
