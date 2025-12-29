import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/pdf-signer/',
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      // 如果有需要可以加 alias
    },
  },
});
