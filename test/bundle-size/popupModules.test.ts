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

  // The code of an app that imports the file alone, Solid left out.
  const bundledCode = async (file: string) =>
    (await bundleApp(file))
      .map((chunk) => (chunk.type === "chunk" ? chunk.code : ""))
      .join("\n");

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
    const code = await bundledCode(file);
    expect(code).toContain("trackSafeArea");
    expect(code).not.toMatch(/setTimeout|setInterval/);
  });

  it("hover bundles no group", async () => {
    expect(
      await findForbiddenModules(built("hover/hover"), ["hover/group"]),
    ).toEqual([]);
  });

  // Menu holds focus on its items, Combobox in its input (#97): each ships
  // one way.
  it("roving list navigation bundles no aria-activedescendant", async () => {
    const file = built("list-navigation/roving");
    expect(
      await findForbiddenModules(file, ["list-navigation/activeDescendant"]),
    ).toEqual([]);
    const code = await bundledCode(file);
    expect(code).not.toContain("activeId");
  });

  it("aria-activedescendant list navigation bundles no roving focus", async () => {
    const file = built("list-navigation/activeDescendant");
    expect(
      await findForbiddenModules(file, ["list-navigation/roving"]),
    ).toEqual([]);
    const code = await bundledCode(file);
    expect(code).not.toContain("preventScroll");
  });

  // Combobox uses list navigation and filters instead of typing ahead
  // (#98): the component hands typeahead its items, and neither folder
  // imports the other.
  it.each([
    "list-navigation/listNavigation",
    "list-navigation/roving",
    "list-navigation/activeDescendant",
  ])("%s bundles no typeahead", async (file) => {
    expect(await findForbiddenModules(built(file), ["typeahead"])).toEqual([]);
  });

  it("typeahead bundles no list navigation", async () => {
    expect(
      await findForbiddenModules(built("typeahead/typeahead"), [
        "list-navigation",
      ]),
    ).toEqual([]);
  });

  // Framework-free, as the safe area is: the typed string's timer is the
  // binding's.
  it("the typeahead matcher bundles no Solid and no timer", async () => {
    const code = await bundledCode(built("typeahead/match"));
    expect(code).toContain("findMatch");
    expect(code).not.toMatch(/solid-js|@solidjs\/web|setTimeout|setInterval/);
  });

  // Solid's store engine costs an app with no store about 8.2 kB gzipped
  // (list-navigation/README.md, Decisions). Solid is left out of the
  // bundle, so what the file imports from it shows.
  it.each([
    "list-navigation/listNavigation",
    "list-navigation/roving",
    "list-navigation/activeDescendant",
  ])("%s imports none of Solid's store engine", async (file) => {
    expect(await bundledCode(built(file))).not.toMatch(
      /\b(createProjection|createStore|createOptimisticStore|snapshot)\b/,
    );
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
