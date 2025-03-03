import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'url';
import path from 'path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'src/main.js')
      }
    }
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
      '/live': 'http://localhost:3000',
      '/sample': 'http://localhost:3000'
    }
  }
});