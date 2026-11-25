// Checks of several modules imported together, for comparison.size-limit.js
// and pairs.size-limit.js.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { inProduction, solidProduction } from "./productionConstants.ts";

const entries = join(import.meta.dirname, "dist/together");

/** The file that `module`, such as `menhir/menu`, resolves to from here. */
export const file = (module: string) =>
  fileURLToPath(import.meta.resolve(module));

/**
 * An app that imports every one of `modules` and uses every part of each.
 * size-limit names every `*` import `all`, so it cannot import several
 * modules in one check: this writes a module that re-exports them all, for
 * the check to import instead.
 */
export function together(
  name: string,
  modules: string[],
): Record<string, string> {
  mkdirSync(entries, { recursive: true });
  const entry = join(entries, `${name.replace(/[^\w]+/g, "-")}.js`);
  writeFileSync(
    entry,
    modules
      .map(
        (module, i) =>
          `export * as m${i} from ${JSON.stringify(file(module))};\n`,
      )
      .join(""),
  );
  return { [entry]: "*" };
}

/**
 * A check of menhir's `components`, by the subpath of their entry points,
 * imported together and measured as .size-limit.js measures one entry
 * point.
 */
export const menhirTogether = (name: string, components: string[]) => ({
  name,
  import: together(
    name,
    components.map((component) => `menhir/${component}`),
  ),
  gzip: true,
  ignore: ["solid-js", "@solidjs/web"],
  modifyRolldownConfig: inProduction(solidProduction),
});
