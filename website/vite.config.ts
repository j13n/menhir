import tailwindcss from "@tailwindcss/vite";
import { fileRoutes } from "filesystem-routing/vite";
import { sitemap, type PrerenderIntegration } from "prerender-crawler";
import { prerender } from "prerender-crawler/vite";
import { defineConfig } from "vitest/config";
import solid from "@solidjs/vite-plugin";

import componentList from "./vite-plugin-component-list.ts";
import componentMarkdown from "./vite-plugin-component-markdown.ts";
import highlight from "./vite-plugin-highlight.ts";
import menhirSizes from "./vite-plugin-sizes.ts";
import { lastModified } from "./sitemap-lastmod.ts";
import { siteUrl } from "./src/site.ts";

export default defineConfig({
  // Start mode with SSR: no index.html and no mount file. The plugin generates
  // the entries around src/App.tsx (wrapped in src/Document.tsx). `ssr: true`
  // builds the server handler the prerender plugin crawls, and compiles the
  // client to hydrate the HTML it writes. The server runs only in `vite dev`
  // and `vite build`: dist/client is a purely static site.
  plugins: [
    // `extensions` makes @solidjs/vite-plugin also compile the `?pick=` route
    // modules the fileRoutes plugin emits (their ids end in a query string).
    solid({
      start: true,
      ssr: true,
      extensions: [".jsx", ".tsx"],
      diagnostics: true,
    }),
    // Crawls the built server from the pages src/App.tsx announces and the
    // links on them, writing each page as HTML; a link to a missing page
    // fails the build. Flat files (styling.html, not styling/index.html) keep
    // Cloudflare from redirecting every page to a trailing slash.
    prerender({
      mode: "static",
      autoSubfolderIndex: false,
      // Links to files, such as each component's Markdown version, are the
      // client build's assets, not pages.
      filter: (path) => !/\.\w+$/.test(path),
      // Each page's <lastmod> is its sources' last commit.
      integrations: [
        sitemap({
          hostname: siteUrl,
          entry: (page) => ({ lastmod: lastModified(page.path) }),
        }),
        notFoundPage(),
      ],
    }),
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

/**
 * Writes the 404 page to 404.html, which wrangler.jsonc serves for paths
 * without a file. The crawl writes only pages that answer 2xx, and the 404
 * page answers 404, so it is fetched here instead.
 */
function notFoundPage(): PrerenderIntegration {
  return {
    name: "not-found-page",
    async teardown(context) {
      const response = await context.fetch("/404");
      if (response.status !== 404) {
        throw new Error(`/404 answered ${response.status}, not 404`);
      }
      context.emitFile({
        filename: "404.html",
        contents: await response.text(),
      });
    },
  };
}
