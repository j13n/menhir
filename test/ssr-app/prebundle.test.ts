// Runs the app in a dev server whose server environment pre-bundles its
// dependencies, as it does under `@cloudflare/vite-plugin`: Vite leaves
// that off for a server environment, and a host that runs the server
// outside Node turns it on. `pnpm test` builds menhir first.
import { rmSync } from "node:fs";

import { createServer } from "vite";
import type { ViteDevServer } from "vite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const root = `${import.meta.dirname}/`;

let server: ViteDevServer;
// A cache of its own, so that the pre-bundling runs. Inside node_modules,
// from where a pre-bundled dependency finds the ones it leaves external.
const cacheDir = `${root}node_modules/.vite-prebundle`;

describe("a dev server that pre-bundles the server's dependencies", () => {
  beforeAll(async () => {
    rmSync(cacheDir, { recursive: true, force: true });
    server = await createServer({
      root,
      cacheDir,
      logLevel: "silent",
      server: { port: 0 },
      // The workspace links menhir, and Vite pre-bundles no linked package.
      // Kept as the path in node_modules, it is a dependency like any other.
      resolve: { preserveSymlinks: true },
      environments: {
        ssr: {
          optimizeDeps: {
            noDiscovery: false,
            entries: ["src/entry-server.tsx"],
          },
        },
      },
    });
    await server.listen();
  });

  afterAll(async () => {
    await server.close();
    rmSync(cacheDir, { recursive: true, force: true });
  });

  it("pre-bundles nothing of menhir, whose JSX source is the Solid plugin's to compile", async () => {
    const optimizer = server.environments.ssr!.depsOptimizer!;
    await optimizer.scanProcessing;
    const prebundled = () => Object.keys(optimizer.metadata.optimized);

    // The check means something only once the pre-bundling has run.
    await expect.poll(prebundled).toContain("@solidjs/web");
    // The pre-bundler compiles JSX for React, not for Solid: a component it
    // takes fails with "React is not defined". It takes only an entry that
    // ends in `.js` or `.ts`, so menhir's `solid` entries end in `.jsx`.
    expect(prebundled().filter((id) => id.startsWith("menhir"))).toEqual([]);
  });
});
