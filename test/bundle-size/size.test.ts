// Runs `size-limit --json`, the report the docs size table is to be built
// from (#38), and checks it.
// `pnpm test` builds menhir first, so the sizes are of the current source.
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

import { beforeAll, describe, expect, it } from "vitest";

const root = import.meta.dirname;

type SizeLimitResult = {
  name: string;
  size: number;
  sizeLimit: number;
  passed: boolean;
};

function runSizeLimit(): SizeLimitResult[] {
  const run = spawnSync(`${root}/node_modules/.bin/size-limit`, ["--json"], {
    cwd: root,
    encoding: "utf8",
  });
  // Over budget, size-limit exits with 1 and still prints the report. On an
  // error, such as a missing config, it prints `{ "error": stack }` instead.
  const report = JSON.parse(run.stdout);
  if (!Array.isArray(report)) throw new Error(report.error);
  return report;
}

const manifest = JSON.parse(
  readFileSync(new URL(import.meta.resolve("menhir/package.json")), "utf8"),
);
const entryPoints = Object.keys(manifest.exports)
  .filter((subpath) => subpath !== "./package.json")
  .map((subpath) => `menhir/${subpath.slice("./".length)}`);

describe("size-limit", () => {
  let results: SizeLimitResult[];

  beforeAll(() => {
    results = runSizeLimit();
  });

  it("has one budget per entry point of menhir", () => {
    expect(results.map((result) => result.name).sort()).toEqual(
      entryPoints.sort(),
    );
  });

  it("reports each entry point's size in bytes, within its budget", () => {
    for (const result of results) {
      expect(result).toEqual({
        name: result.name,
        size: expect.any(Number),
        sizeLimit: expect.any(Number),
        passed: true,
      });
      expect(result.size).toBeGreaterThan(0);
    }
  });
});
