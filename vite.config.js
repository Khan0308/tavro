import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    // terser's browser bundle (UMD) is not reachable through its package exports, so alias it.
    alias: { 'terser-browser': fileURLToPath(new URL('./node_modules/terser/dist/bundle.min.js', import.meta.url)) },
  },
  test: { environment: 'jsdom', globals: true },
});
