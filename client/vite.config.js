import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// During development every request to /api is proxied to the ASP.NET Core server,
// so the client can use relative URLs and no CORS setup is needed.
// Override the target with the API_TARGET environment variable if the server runs elsewhere.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.API_TARGET || 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
