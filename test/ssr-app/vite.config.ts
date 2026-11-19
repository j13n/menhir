import solid from "@solidjs/vite-plugin";
import { defineConfig } from "vite";

// A minimal server-rendered app that uses the built `menhir` package the way
// an installed app does: `ssr: true` and nothing about menhir. ssr.test.ts
// builds it.
export default defineConfig({
  plugins: [solid({ ssr: true })],
});
