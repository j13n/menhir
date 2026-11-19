import { defineConfig } from "vitest/config";

// Checks on the built package (PLAN.md section 6). Kept out of
// vitest.config.ts so that `vitest`, and its watch mode, do not rebuild dist.
// `pnpm test:package` builds, then runs these.
export default defineConfig({
  test: {
    name: "package",
    environment: "node",
    include: ["test/package/**/*.test.ts"],
  },
});
