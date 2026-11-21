import tailwindcss from "@tailwindcss/vite";
import { fileRoutes } from "filesystem-routing/vite";
import { defineConfig } from "vitest/config";
import solid from "@solidjs/vite-plugin";

import componentList from "./vite-plugin-component-list.ts";
import componentMarkdown from "./vite-plugin-component-markdown.ts";
import highlight from "./vite-plugin-highlight.ts";
import menhirSizes from "./vite-plugin-sizes.ts";

export default defineConfig({
  // Turnkey client mode: no index.html and no mount file — the plugin generates
  // the entries around src/App.tsx (wrapped in src/Document.tsx) and `vite build`
  // prerenders the shell into a purely static dist/client.
  plugins: [
    // `extensions` makes @solidjs/vite-plugin also compile the `?pick=` route
    // modules the fileRoutes plugin emits (their ids end in a query string).
    solid({ start: true, extensions: [".jsx", ".tsx"], diagnostics: true }), // add `ssr: true` for streaming SSR
    fileRoutes({ types: true }),
    tailwindcss(),
    // Code highlighted when the site is built: src/highlight.ts's tags,
    // `?highlight` imports and `virtual:highlight-theme.css`.
    highlight(),
    // `virtual:menhir-sizes`, from test/bundle-size/dist/sizes.json.
    menhirSizes(),
    // /docs/components/<slug>.md, each component page as Markdown for agents.
    componentMarkdown(),
    // `virtual:component-list`, the components' slugs and names for the sidebar.
    componentList(),
  ],
  server: {
    port: 3000,
  },
  test: {
    environment: "jsdom",
    globals: false,
    setupFiles: ["./vitest-setup.ts"],
    // if you have few tests, try commenting this
    // out to improve performance:
    isolate: false,
  },
  build: {
    target: "esnext",
    assetsInlineLimit: 0,
  },
});
