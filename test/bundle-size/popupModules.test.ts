import { describe, expect, it } from "vitest";

import { popupComponents } from "../../packages/menhir/layers.ts";
import { entryPoints } from "./entryPoints.ts";
import { findForbiddenModules, forbiddenModules } from "./popupModules.ts";

describe.each(Object.entries(forbiddenModules))(
  "%s",
  (entryPoint, forbidden) => {
    // Skipped until the popup is in menhir's `exports`.
    it.skipIf(!entryPoints.includes(entryPoint))(
      `bundles none of ${forbidden.join(", ")}`,
      async () => {
        expect(await findForbiddenModules(entryPoint, forbidden)).toEqual([]);
      },
    );
  },
);

describe("forbiddenModules", () => {
  // Its type allows only modules of the floating layer.
  it("names only popup entry points", () => {
    for (const entryPoint of Object.keys(forbiddenModules))
      expect(popupComponents).toContain(entryPoint.slice("menhir/".length));
  });
});

describe("findForbiddenModules", () => {
  it("reports the forbidden modules a popup entry bundles, and nothing it may use", async () => {
    expect(
      await findForbiddenModules("./fixtures/leaky/dist/dialog/index.js", [
        "@floating-ui",
        "positioning",
        "hover",
      ]),
    ).toEqual(["@floating-ui", "positioning"]);
  });
});
