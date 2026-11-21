// @vitest-environment node
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import {
  build,
  createLogger,
  createServer,
  type InlineConfig,
  type Rolldown,
} from "vite";
import { describe, expect, test } from "vitest";

import menhirSizes from "./vite-plugin-sizes.ts";

type SizesModule = typeof import("virtual:menhir-sizes");
type SizeModule = typeof import("virtual:menhir-sizes/switch");

const switchReport = [
  { name: "menhir/switch", passed: true, size: 1914, sizeLimit: 2300 },
];

/** A path for a report in a new temporary folder, with nothing there yet. */
function reportPath() {
  return join(mkdtempSync(join(tmpdir(), "menhir-sizes-")), "sizes.json");
}

function writeReport(report: unknown) {
  const file = reportPath();
  writeFileSync(file, JSON.stringify(report));
  return file;
}

/**
 * Imports the module `id` through Vite with the plugin reading `file`: from a
 * dev server for "serve", from a build for "build".
 */
async function loadModule<M>(
  file: string,
  command: "build" | "serve",
  id: string,
) {
  const warnings: string[] = [];
  const logger = createLogger("silent");
  logger.warn = (message) => {
    warnings.push(message);
  };
  const config: InlineConfig = {
    configFile: false,
    root: dirname(file),
    customLogger: logger,
    plugins: [menhirSizes({ file })],
  };

  if (command === "serve") {
    // A module runner, as Vitest uses, also loads what the module imports.
    const server = await createServer({
      ...config,
      server: { middlewareMode: true, ws: false, watch: null },
    });
    try {
      const module = (await server.ssrLoadModule(id)) as M;
      return { module, warnings };
    } finally {
      await server.close();
    }
  }

  const output = (await build({
    ...config,
    build: {
      write: false,
      rolldownOptions: {
        input: id,
        preserveEntrySignatures: "strict",
      },
    },
  })) as Rolldown.RolldownOutput;
  const module: M = await import(
    /* @vite-ignore */
    `data:text/javascript,${encodeURIComponent(output.output[0].code)}`
  );
  return { module, warnings };
}

const loadSizes = (file: string, command: "build" | "serve") =>
  loadModule<SizesModule>(file, command, "virtual:menhir-sizes");

const loadSwitchSize = (file: string, command: "build" | "serve") =>
  loadModule<SizeModule>(file, command, "virtual:menhir-sizes/switch");

describe("virtual:menhir-sizes", () => {
  test("lists each entry point's measured size and budget from the size-limit report", async () => {
    const { module } = await loadSizes(writeReport(switchReport), "build");
    expect(module.sizes).toEqual([
      { entryPoint: "menhir/switch", size: 1914, limit: 2300 },
    ]);
  });

  test("gives a component page its entry point's measured size", async () => {
    const { module } = await loadSwitchSize(writeReport(switchReport), "build");
    expect(module.default).toBe(1914);
  });

  test("fails the build when a page asks for an entry point the report does not have", async () => {
    const file = writeReport(switchReport);
    await expect(
      loadModule(file, "build", "virtual:menhir-sizes/toggle"),
    ).rejects.toThrow(
      `menhir/toggle is not in ${file}. Give it a size budget in test/bundle-size/.size-limit.js`,
    );
  });

  test("serves no size in dev and tests for an entry point the report does not have, with a warning", async () => {
    const file = writeReport(switchReport);
    const { module, warnings } = await loadModule<SizeModule>(
      file,
      "serve",
      "virtual:menhir-sizes/toggle",
    );
    expect(module.default).toBeUndefined();
    expect(warnings).toEqual([
      expect.stringContaining(`menhir/toggle is not in ${file}`),
    ]);
  });

  test("fails the build when the report is missing, and says how to make it", async () => {
    await expect(loadSwitchSize(reportPath(), "build")).rejects.toThrow(
      "pnpm --filter @menhir/bundle-size size:json",
    );
  });

  test("serves no sizes in dev and tests when the report is missing, with a warning", async () => {
    const missing = reportPath();
    const sizes = await loadSizes(missing, "serve");
    expect(sizes.module.sizes).toEqual([]);
    expect(sizes.warnings).toEqual([
      expect.stringContaining("pnpm --filter @menhir/bundle-size size:json"),
    ]);
    const { module, warnings } = await loadSwitchSize(missing, "serve");
    expect(module.default).toBeUndefined();
    expect(warnings).toEqual([
      expect.stringContaining("pnpm --filter @menhir/bundle-size size:json"),
    ]);
  });

  test.each([
    ["size-limit's error report", { error: "Error: Create Size Limit config" }],
    ["a result without a size", [{ name: "menhir/switch", sizeLimit: 2300 }]],
  ])("rejects %s, in dev as in the build", async (_, report) => {
    const file = writeReport(report);
    for (const command of ["build", "serve"] as const) {
      await expect(loadSizes(file, command)).rejects.toThrow(
        `${file} is not a size-limit --json report`,
      );
    }
  });
});
