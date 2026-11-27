// Base UI on React 19.
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5193,
    strictPort: true,
    // In a container the sources are a mounted folder, which sends no file
    // events (compose.yaml).
    watch: process.env.POLL ? { usePolling: true } : undefined,
  },
});
