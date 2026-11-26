// Checks on the built package (PLAN.md section 6). Run by
// `pnpm test:package`, which builds first, so dist is current.
import { globSync, readFileSync } from "node:fs";
import { dirname } from "node:path";

import { build } from "vite";
import { describe, expect, it } from "vitest";

const root = new URL("../../", import.meta.url);
const manifest = JSON.parse(
  readFileSync(new URL("package.json", root), "utf8"),
);

function files(pattern: string, cwd: string, exclude: string[] = []) {
  return globSync(pattern, { cwd: new URL(cwd, root), exclude }).sort();
}

const sources = files("**/*.{ts,tsx}", "src/", ["**/*.test.*"]);

// core/index.ts only documents the layer: no entry imports it, so the Vite
// build, which starts from the component entries, does not reach it.
const isUnreached = (file: string) => file === "core/index.ts";

const { "./package.json": _, ...components } = manifest.exports;

describe("built package", () => {
  it("has one compiled file per source module", () => {
    const expected = sources
      .filter((file) => !isUnreached(file))
      .map((file) => file.replace(/\.tsx?$/, ".js"))
      .sort();

    expect(files("**/*.js", "dist/", ["source/**"])).toEqual(expected);
  });

  it("has the source and the types of every source module", () => {
    // tsc covers all of src, core included. The build's last step,
    // solidEntries.ts, renames each entry to `.jsx`.
    const entries = new Set(
      Object.values<Record<string, string>>(components).map(({ solid }) =>
        solid.replace("./dist/source/", "").replace(/\.jsx$/, ".ts"),
      ),
    );
    const expected = sources
      .flatMap((file) => [
        entries.has(file)
          ? file.replace(/\.ts$/, ".jsx")
          : file.replace(/\.tsx$/, ".jsx").replace(/\.ts$/, ".js"),
        file.replace(/\.tsx?$/, ".d.ts"),
      ])
      .sort();

    expect(files("**/*.{js,jsx,ts}", "dist/source/")).toEqual(expected);
  });

  it("exports each component, listing types, then solid, then import", () => {
    // A component is a folder in src with an index.ts. The layers, core and
    // floating, are internal. A utility can have several, one folder down,
    // such as color-scheme/cookie/index.ts.
    const isInternal = (subpath: string) =>
      /^\.\/(core|floating)(\/|$)/.test(subpath);
    const expected = files("{*,*/*}/index.ts", "src/")
      .map((file) => `./${dirname(file)}`)
      .filter((subpath) => !isInternal(subpath))
      // Sorted as subpaths: sorted as files, `toggle-group/index.ts` comes
      // before `toggle/index.ts`.
      .sort();

    expect(Object.keys(components).sort()).toEqual(expected);
    for (const conditions of Object.values<Record<string, string>>(
      components,
    )) {
      expect(Object.keys(conditions)).toEqual(["types", "solid", "import"]);
      for (const file of Object.values(conditions)) {
        expect(files(file, "./")).toHaveLength(1);
      }
    }
  });

  it("names a `.jsx` file as every solid entry, which no pre-bundler takes", () => {
    // A pre-bundler compiles JSX for React. Vite's takes an entry ending in
    // `.js` or `.ts` and every module it imports, and leaves one ending in
    // `.jsx` to the Solid plugin (test/ssr-app/prebundle.test.ts).
    for (const { solid } of Object.values<Record<string, string>>(components)) {
      expect(solid).toMatch(/\/index\.jsx$/);
    }
  });

  it("lets a bundler drop a part the app does not use", async () => {
    const code = await bundle("rootOnly.js");

    expect(code).toContain("function SwitchRoot");
    expect(code).not.toContain("SwitchThumb");
  });

  it("leaves out a popup's part the app does not render", async () => {
    const code = await bundle("dialogWithoutDescription.js");

    expect(code).toContain("function DialogTitle");
    expect(code).not.toContain("DialogDescription");
  });

  it("leaves out the Arrow, and the arrow middleware, when the app renders no Arrow", async () => {
    // `@floating-ui/dom` names its middleware, so the bundle shows which
    // it holds.
    const middleware = /name: "arrow"/;
    expect(await bundle("popover.js")).toMatch(middleware);

    const code = await bundle("popoverWithoutArrow.js");
    expect(code).toContain("function PopoverPopup");
    expect(code).not.toContain("PopoverArrow");
    expect(code).not.toMatch(middleware);
  });

  it("leaves out the submenus, and the safe area, when the app renders no Submenu", async () => {
    // The safe area follows the pointer on the document, which nothing
    // else in Menu does.
    const safeArea = /"pointerout"/;
    expect(await bundle("menu.js")).toMatch(safeArea);

    const code = await bundle("menuWithoutSubmenu.js");
    expect(code).toContain("function MenuPopup");
    expect(code).not.toContain("MenuSubmenuTrigger");
    expect(code).not.toMatch(safeArea);
  });

  it("leaves out the Group, and the delay group, when the app renders no Group", async () => {
    // The group keeps the time of the last closing, which nothing else in
    // Tooltip reads.
    const group = /Date\.now\(\)/;
    expect(await bundle("tooltip.js")).toMatch(group);

    const code = await bundle("tooltipWithoutGroup.js");
    expect(code).toContain("function TooltipRoot");
    expect(code).not.toContain("TooltipGroup(");
    expect(code).not.toMatch(group);
  });

  it("bundles the parts Dialog and Alert Dialog share once, and Dialog's outside press", async () => {
    const code = await bundle("dialogAndAlertDialog.js");

    for (const name of [
      "DialogRoot",
      "DialogTitle",
      "renderDialogPopup",
      "DialogPopup",
      "AlertDialogPopup",
      "createOutsidePress",
    ]) {
      expect(count(code, name)).toBe(1);
    }
  });

  it("bundles the parts Combobox and Autocomplete share once", async () => {
    const code = await bundle("comboboxAndAutocomplete.js");

    for (const name of [
      "createComboboxBase",
      "createComboboxInput",
      "createComboboxItem",
      "ComboboxTrigger",
      "ComboboxClear",
      "ComboboxPopup",
      "ComboboxList",
      "ComboboxGroup",
      "ComboboxStatus",
      "includesText",
      "createPosition",
      "createActiveDescendantList",
      "AutocompleteRoot",
      "AutocompleteInput",
      "AutocompleteItem",
    ]) {
      expect(count(code, name)).toBe(1);
    }
  });

  it("bundles the parts Combobox and Multi Combobox share once", async () => {
    const code = await bundle("comboboxAndMultiCombobox.js");

    for (const name of [
      "createComboboxBase",
      "createComboboxInput",
      "createComboboxItem",
      "ComboboxTrigger",
      "ComboboxClear",
      "ComboboxPopup",
      "ComboboxList",
      "ComboboxItemIndicator",
      "ComboboxGroup",
      "ComboboxStatus",
      "includesText",
      "createPosition",
      "createActiveDescendantList",
      "MultiComboboxRoot",
      "MultiComboboxInput",
      "MultiComboboxItem",
      "MultiComboboxChip",
    ]) {
      expect(count(code, name)).toBe(1);
    }
  });

  it("bundles the parts Menu and Context Menu share once", async () => {
    const code = await bundle("menuAndContextMenu.js");

    for (const name of [
      "createMenu",
      "MenuPopup",
      "MenuItem",
      "MenuSubmenuTrigger",
      "createRovingList",
      "createTypeahead",
      "createPosition",
      "MenuTrigger",
      "ContextMenuRoot",
      "ContextMenuTrigger",
      "ContextMenuPopup",
    ]) {
      expect(count(code, name)).toBe(1);
    }
  });

  it("bundles the parts Menu and Menubar share once", async () => {
    const code = await bundle("menuAndMenubar.js");

    for (const name of [
      "createMenu",
      "MenuPopup",
      "MenuItem",
      "MenuSubmenuTrigger",
      "MenuTrigger",
      "createRovingList",
      "createTypeahead",
      "createPosition",
      "MenubarRoot",
      "MenubarMenu",
      "MenubarTrigger",
    ]) {
      expect(count(code, name)).toBe(1);
    }
  });
});

/** How many functions named `name` a bundle's code declares. */
function count(code: string, name: string): number {
  return code.split(new RegExp(`function ${name}\\b`)).length - 1;
}

/** Bundles a fixture app as a bundler would, and returns its code. */
async function bundle(fixture: string): Promise<string> {
  const result = await build({
    configFile: false,
    logLevel: "silent",
    build: {
      write: false,
      minify: false,
      lib: {
        entry: new URL(`test/package/fixtures/${fixture}`, root).pathname,
        formats: ["es"],
      },
      rolldownOptions: { external: [/^solid-js/, /^@solidjs\//] },
    },
  });
  // Library mode gives one bundle per format, and without the watch option
  // never a watcher.
  const [bundle] = [result].flat();
  if (!bundle || !("output" in bundle)) {
    throw new Error("Expected one bundle from the build");
  }
  return bundle.output[0].code;
}
