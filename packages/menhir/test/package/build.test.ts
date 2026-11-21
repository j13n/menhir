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

describe("built package", () => {
  it("has one compiled file per source module", () => {
    const expected = sources
      .filter((file) => !isUnreached(file))
      .map((file) => file.replace(/\.tsx?$/, ".js"))
      .sort();

    expect(files("**/*.js", "dist/", ["source/**"])).toEqual(expected);
  });

  it("has the source and the types of every source module", () => {
    // tsc covers all of src, core included.
    const expected = sources
      .flatMap((file) => [
        file.replace(/\.tsx$/, ".jsx").replace(/\.ts$/, ".js"),
        file.replace(/\.tsx?$/, ".d.ts"),
      ])
      .sort();

    expect(files("**/*.{js,jsx,ts}", "dist/source/")).toEqual(expected);
  });

  it("exports each component, listing types, then solid, then import", () => {
    const { "./package.json": _, ...components } = manifest.exports;
    // A component is a folder in src with an index.ts. core is internal. A
    // utility can have several, one folder down, such as
    // color-mode/cookie/index.ts.
    const expected = files("{*,*/*}/index.ts", "src/")
      .map((file) => `./${dirname(file)}`)
      .filter((subpath) => subpath !== "./core");

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

  it("lets a bundler drop a part the app does not use", async () => {
    const result = await build({
      configFile: false,
      logLevel: "silent",
      build: {
        write: false,
        minify: false,
        lib: {
          entry: new URL("test/package/fixtures/rootOnly.js", root).pathname,
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
    const { code } = bundle.output[0];

    expect(code).toContain("function SwitchRoot");
    expect(code).not.toContain("SwitchThumb");
  });
});
