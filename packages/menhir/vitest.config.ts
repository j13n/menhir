import solid from "@solidjs/vite-plugin";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

// Tests run in jsdom. VITEST_ENV=chromium runs the same suite in Chromium
// through Playwright, the switch Base UI uses (PLAN.md section 7).
const chromium = process.env.VITEST_ENV === "chromium";

export default defineConfig({
  plugins: [solid()],
  test: {
    environment: "jsdom",
    // createRenderer registers the cleanup itself because globals are off.
    globals: false,
    setupFiles: ["./test/setup.ts"],
    browser: chromium
      ? {
          enabled: true,
          provider: playwright(),
          headless: true,
          instances: [{ browser: "chromium" }],
          screenshotFailures: false,
        }
      : undefined,
  },
});
