// Checks the budgets of the `floating` layer's modules, which have no entry
// point and so no budget in .size-limit.js (PLAN.md section 6).
// `pnpm test` builds menhir first, so the sizes are of the current source.
import { readdirSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { floatingBudgets } from "./floatingBudgets.ts";
import { runSizeLimit } from "./runSizeLimit.ts";

/** The module folders in src/floating. */
const moduleFolders = readdirSync(
  new URL("../../packages/menhir/src/floating/", import.meta.url),
  { withFileTypes: true },
)
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

describe("the floating layer's budgets", () => {
  it("cover every module folder in src/floating", () => {
    const budgeted = Object.keys(floatingBudgets);
    expect(
      moduleFolders.filter(
        (folder) => !budgeted.some((file) => file.startsWith(`${folder}/`)),
      ),
    ).toEqual([]);
  });

  it.skipIf(Object.keys(floatingBudgets).length === 0)(
    "hold each module's size",
    () => {
      const report = runSizeLimit("floating.size-limit.js");
      expect(report.map((result) => result.name).sort()).toEqual(
        Object.keys(floatingBudgets)
          .map((file) => `floating/${file}`)
          .sort(),
      );
      for (const result of report)
        expect(result).toMatchObject({ passed: true });
    },
  );
});
