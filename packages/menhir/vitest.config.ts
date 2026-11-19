import solid from "@solidjs/vite-plugin";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

// Tests run in jsdom. VITEST_ENV=chromium runs the same suite in Chromium
// through Playwright, the switch Base UI uses (PLAN.md section 7).
const chromium = process.env.VITEST_ENV === "chromium";

// A function, because Vitest writes to the `browser` object of each project.
const dom = () => ({
  environment: "jsdom",
  // createRenderer registers the cleanup itself because globals are off.
  globals: false,
  setupFiles: ["./test/setup.ts"],
  browser: chromium
    ? {
        enabled: true,
        provider: playwright(),
        headless: true,
        instances: [{ browser: "chromium" as const }],
        screenshotFailures: false,
      }
    : undefined,
});

const hydrateTests = "{src,test}/**/*.hydrate.test.tsx";
const workspaceTests = "test/workspace/**/*.test.ts";

export default defineConfig({
  test: {
    // Each project compiles JSX differently, so each needs its own Vite
    // server, not Vitest 5's shared one.
    sharedViteServer: false,
    projects: [
      {
        plugins: [solid()],
        test: {
          ...dom(),
          name: "client",
          include: ["{src,test}/**/*.test.{ts,tsx}"],
          // test/package checks dist; vitest.package.config.ts runs it.
          exclude: [hydrateTests, workspaceTests, "test/package/**"],
        },
      },
      {
        // The plugin compiles tests as non-hydratable DOM code. Hydrate tests
        // need the hydratable output an SSR app's client build gets.
        plugins: [solid({ solid: { hydratable: true } })],
        test: {
          ...dom(),
          name: "hydrate",
          include: [hydrateTests],
          globalSetup: ["./test/ssr/renderServer.ts"],
          // Vitest's transform cache is keyed by file, not by plugin options.
          // Sharing it would hand this project the `client` project's
          // non-hydratable output for the same source file, and the reverse.
          fsModuleCachePath: "node_modules/.vitest-cache-hydrate",
        },
      },
      {
        // Checks on the workspace itself, such as the lockfile. They read
        // files from disk, so they run in Node, also under VITEST_ENV=chromium.
        test: {
          name: "workspace",
          environment: "node",
          include: [workspaceTests],
        },
      },
    ],
  },
});
