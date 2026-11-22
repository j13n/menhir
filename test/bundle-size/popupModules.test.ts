import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { popupComponents } from "../../packages/menhir/layers.ts";
import { entryPoints } from "./entryPoints.ts";
import { bundleApp } from "./findFloatingModules.ts";
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

// One file per behaviour (PLAN.md section 6, rule 6), checked on the
// modules themselves until the popups that use them are built.
describe("a floating module alone", () => {
  const built = (file: string) =>
    fileURLToPath(
      new URL(
        `dist/floating/${file}.js`,
        import.meta.resolve("menhir/package.json"),
      ),
    );

  it.each(["focus/initialFocus", "focus/returnFocus"] as const)(
    "%s bundles no Tab wrap and no tabbable search",
    async (file) => {
      expect(
        await findForbiddenModules(built(file), [
          "focus/tabWrap",
          "focus/tabbable",
        ]),
      ).toEqual([]);
    },
  );

  // A submenu uses the safe area without the delays (#30).
  it("the safe area bundles no timer, and no other file of hover", async () => {
    const file = built("hover/safeArea");
    expect(
      await findForbiddenModules(file, ["hover/hover", "hover/group"]),
    ).toEqual([]);
    const code = (await bundleApp(file))
      .map((chunk) => (chunk.type === "chunk" ? chunk.code : ""))
      .join("\n");
    expect(code).toContain("trackSafeArea");
    expect(code).not.toMatch(/setTimeout|setInterval/);
  });

  it("hover bundles no group", async () => {
    expect(
      await findForbiddenModules(built("hover/hover"), ["hover/group"]),
    ).toEqual([]);
  });

  it("Escape bundles no other way of closing", async () => {
    expect(
      await findForbiddenModules(built("dismissal/escape"), [
        "dismissal/outsidePress",
        "dismissal/dialogClose",
        "dismissal/popoverClose",
      ]),
    ).toEqual([]);
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

  it("reports a forbidden file of a module, and not the module's other files", async () => {
    expect(
      await findForbiddenModules("./fixtures/leaky/dist/dialog/index.js", [
        "dismissal/escape",
        "dismissal/outsidePress",
      ]),
    ).toEqual(["dismissal/escape"]);
  });
});
