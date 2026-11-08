import { defineConfig } from 'vite';

export default defineConfig({
  // The root is the src/ folder so index.html lives there
  root: 'src',
  publicDir: '../public',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
});
