// Checks that an app with a component and the one it builds on pays for the
// shared code once (PLAN.md section 6, rule 4): the two imported together
// cost at most the pair's margin more than the base alone. The same holds
// for a popup and the one it shares its code with through `floating`.
// `pnpm test` builds menhir first, so the sizes are of the current source.
import { beforeAll, describe, expect, it } from "vitest";

import {
  floatingNeighbourMargins,
  floatingNeighbours,
  popupBaseMargins,
  popupBases,
  simpleBaseMargins,
  simpleBases,
} from "../../packages/menhir/layers.ts";
import { pairChecks, pairs } from "./pairs.ts";
import { runSizeLimit } from "./runSizeLimit.ts";

describe("a component with the one it builds on or shares its code with", () => {
  let sizes: Map<string, number>;

  beforeAll(() => {
    sizes = new Map(
      runSizeLimit("pairs.size-limit.js").map((result) => [
        result.name,
        result.size,
      ]),
    );
  });

  const sizeOf = (check: string) => {
    const size = sizes.get(check);
    if (size === undefined)
      throw new Error(`size-limit did not measure ${check}`);
    return size;
  };

  it("has a margin for every pair in popupBases, simpleBases and floatingNeighbours", () => {
    expect(Object.keys(popupBaseMargins).sort()).toEqual(
      Object.keys(popupBases).sort(),
    );
    expect(Object.keys(simpleBaseMargins).sort()).toEqual(
      Object.keys(simpleBases).sort(),
    );
    expect(Object.keys(floatingNeighbourMargins).sort()).toEqual(
      Object.keys(floatingNeighbours).sort(),
    );
  });

  it.each(pairs)(
    "costs at most its margin over the base: $component on $base",
    (pair) => {
      const base = sizeOf(pairChecks.base(pair.base));
      const together = sizeOf(pairChecks.together(pair));
      // Together, the pair holds the component's own code too, so a check
      // that measured the base twice cannot pass.
      expect(together).toBeGreaterThan(base);
      expect(together - base).toBeLessThanOrEqual(pair.margin);
    },
  );
});
