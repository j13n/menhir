import { existsSync, readFileSync } from "node:fs";

import solid from "@solidjs/vite-plugin";
import { defineConfig, type Plugin } from "vite";

// Builds the compiled `import` entries (PLAN.md section 6). The JSX source and
// the types under dist/source come from `tsc -p tsconfig.build.json`. Vitest
// reads vitest.config.ts, not this file.

// One entry per component or utility, named after its subpath export.
// `exports` in package.json is the only list of them;
// test/package/build.test.ts checks it against the folders in src.
const manifest = JSON.parse(
  readFileSync(new URL("package.json", import.meta.url), "utf8"),
);
const components = Object.keys(manifest.exports)
  .filter((subpath) => subpath !== "./package.json")
  .map((subpath) => subpath.slice("./".length));

// Rolldown 1.2 compiles `export * as Switch from "./index.parts"` into an
// object of getters, and a bundler cannot drop unused parts from an object
// (rule 3). Each parts module is therefore built as an entry of its own, and
// the import of it is left in place as an external one, so index.js keeps the
// namespace re-export.
function keepNamespaceReexports(): Plugin {
  return {
    name: "menhir:keep-namespace-reexports",
    enforce: "pre",
    resolveId(source) {
      if (source === "./index.parts.ts") {
        return { id: "./index.parts.js", external: true };
      }
    },
  };
}

export default defineConfig({
  plugins: [keepNamespaceReexports(), solid()],
  build: {
    target: "esnext",
    minify: false,
    lib: {
      entry: Object.fromEntries(
        components.flatMap((name) => [
          [`${name}/index`, `src/${name}/index.ts`],
          // A utility, such as color-scheme, exports functions and has no parts.
          ...(existsSync(`src/${name}/index.parts.ts`)
            ? [[`${name}/index.parts`, `src/${name}/index.parts.ts`]]
            : []),
        ]),
      ),
      formats: ["es"],
    },
    rolldownOptions: {
      external: [/^solid-js(\/|$)/, /^@solidjs\/web(\/|$)/],
      output: {
        // One output file per source module (rule 2).
        preserveModules: true,
        preserveModulesRoot: "src",
        entryFileNames: "[name].js",
      },
    },
  },
});
