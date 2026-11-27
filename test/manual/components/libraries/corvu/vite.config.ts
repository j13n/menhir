// corvu on Solid 1. The library ships JSX source, which only this plugin
// compiles.
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
  plugins: [solid()],
  server: {
    host: true,
    port: 5192,
    strictPort: true,
    // In a container the sources are a mounted folder, which sends no file
    // events (compose.yaml).
    watch: process.env.POLL ? { usePolling: true } : undefined,
  },
});
