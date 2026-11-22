// The Menhir page, on Solid 2: the repo's test Dialog with createScrollLock.
import solid from "@solidjs/vite-plugin";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [solid()],
  server: { host: true, port: 5180 },
});
