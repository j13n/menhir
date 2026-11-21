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
type ComparisonModule = typeof import("virtual:size-comparison");

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
 * Imports the module `id` through Vite with the plugin reading `file`, and
 * `comparison` for other libraries' sizes: from a dev server for "serve",
 * from a build for "build".
 */
async function loadModule<M>(
  file: string,
  command: "build" | "serve",
  id: string,
  comparison?: string,
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
    plugins: [menhirSizes({ file, comparison })],
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
  test("lists each entry point's measured size from the size-limit report", async () => {
    const { module } = await loadSizes(writeReport(switchReport), "build");
    expect(module.sizes).toEqual([{ entryPoint: "menhir/switch", size: 1914 }]);
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

const radixSwitch = {
  menhirTotal: 1914,
  libraries: [
    {
      name: "Radix",
      framework: "React",
      components: {
        switch: {
          module: "@radix-ui/react-switch",
          version: "1.4.1",
          size: 4690,
        },
      },
      total: { size: 4690, menhir: 1914 },
    },
  ],
};

const loadComparison = (comparison: string, command: "build" | "serve") =>
  loadModule<ComparisonModule>(
    writeReport(switchReport),
    command,
    "virtual:size-comparison",
    comparison,
  );

describe("virtual:size-comparison", () => {
  test("lists other libraries' sizes of menhir's components from the comparison report", async () => {
    const { module } = await loadComparison(writeReport(radixSwitch), "build");
    expect(module.libraries).toEqual(radixSwitch.libraries);
    expect(module.menhirTotal).toBe(1914);
  });

  test("fails the build when the comparison report is missing, and says how to make it", async () => {
    await expect(loadComparison(reportPath(), "build")).rejects.toThrow(
      "pnpm --filter @menhir/bundle-size size:json",
    );
  });

  test("serves no libraries in dev and tests when the comparison report is missing, with a warning", async () => {
    const { module, warnings } = await loadComparison(reportPath(), "serve");
    expect(module.libraries).toEqual([]);
    expect(module.menhirTotal).toBeUndefined();
    expect(warnings).toEqual([
      expect.stringContaining("pnpm --filter @menhir/bundle-size size:json"),
    ]);
  });

  const radix = radixSwitch.libraries[0];

  test.each([
    [
      "a library with a component without a size",
      {
        menhirTotal: 1914,
        libraries: [
          {
            ...radix,
            components: {
              switch: { module: "@radix-ui/react-switch", version: "1.4.1" },
            },
          },
        ],
      },
    ],
    [
      "a library with a total without menhir's size",
      { menhirTotal: 1914, libraries: [{ ...radix, total: { size: 4690 } }] },
    ],
    ["a report without menhir's total", { libraries: radixSwitch.libraries }],
    ["the list of libraries alone, as it was once", radixSwitch.libraries],
  ])("rejects %s", async (_, report) => {
    const file = writeReport(report);
    await expect(loadComparison(file, "build")).rejects.toThrow(
      `${file} is not a comparison report`,
    );
  });
});
