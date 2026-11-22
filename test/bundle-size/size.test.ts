// Runs `size-limit --json`, the report the docs site's sizes are generated
// from (#38), and checks it.
// `pnpm test` builds menhir first, so the sizes are of the current source.
import { beforeAll, describe, expect, it } from "vitest";

import { entryPoints } from "./entryPoints.ts";
import { runSizeLimit, type SizeLimitResult } from "./runSizeLimit.ts";

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
