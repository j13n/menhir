// Measures the other libraries' versions of menhir's components
// (comparison.ts) and, run as a script, writes `dist/comparison.json`, the
// docs site's comparison table.
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { libraries } from "./comparison.ts";

const root = import.meta.dirname;

/** One library in `dist/comparison.json`. */
export type ComparedLibrary = {
  name: string;
  framework: string;
  /** By the subpath of menhir's entry point, such as `switch`. */
  components: Record<string, ComparedComponent>;
};

export type ComparedComponent = {
  /** Such as `@radix-ui/react-switch`. */
  module: string;
  /** The version of the module's package that was measured. */
  version: string;
  /** In bytes, minified and gzipped, the library's framework left out. */
  size: number;
};

export function measureComparison(): ComparedLibrary[] {
  const run = spawnSync(
    `${root}/node_modules/.bin/size-limit`,
    ["--json", "--config", "comparison.size-limit.js"],
    { cwd: root, encoding: "utf8" },
  );
  // On an error, such as a module that does not resolve, size-limit prints
  // `{ "error": stack }` instead of the list of results.
  const report = JSON.parse(run.stdout);
  if (!Array.isArray(report)) throw new Error(report.error);
  const sizes = new Map<string, number>(
    report.map((result: { name: string; size: number }) => [
      result.name,
      result.size,
    ]),
  );

  return libraries.map((library) => ({
    name: library.name,
    framework: library.framework,
    components: Object.fromEntries(
      Object.entries(library.components).map(([component, module]) => {
        const size = sizes.get(module);
        if (size === undefined)
          throw new Error(`size-limit did not measure ${module}`);
        return [component, { module, version: packageVersion(module), size }];
      }),
    ),
  }));
}

/**
 * The version of the package `module` belongs to. Read from the package's
 * own package.json, found above the resolved module, since not every package
 * exports its package.json.
 */
function packageVersion(module: string): string {
  const segments = module.split("/");
  const name = segments.slice(0, module.startsWith("@") ? 2 : 1).join("/");
  let dir = dirname(fileURLToPath(import.meta.resolve(module)));
  for (;;) {
    const file = join(dir, "package.json");
    if (existsSync(file)) {
      const manifest = JSON.parse(readFileSync(file, "utf8"));
      if (manifest.name === name) return manifest.version;
    }
    const parent = dirname(dir);
    if (parent === dir)
      throw new Error(`No package.json of ${name} above ${module}`);
    dir = parent;
  }
}

if (import.meta.main) {
  mkdirSync(join(root, "dist"), { recursive: true });
  writeFileSync(
    join(root, "dist/comparison.json"),
    `${JSON.stringify(measureComparison(), null, 2)}\n`,
  );
}
