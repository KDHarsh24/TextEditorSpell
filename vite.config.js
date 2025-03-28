import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // This ensures Vite binds to 0.0.0.0
    port: 3000, // Use any available port
    strictPort: true, // Ensures Vite doesn't auto-change ports
  }
});
