import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { comparedComponents, libraries, totalChecks } from "./comparison.ts";
import { inProduction, solidProduction } from "./productionConstants.ts";

const file = (module) => fileURLToPath(import.meta.resolve(module));

const entries = join(import.meta.dirname, "dist/together");
mkdirSync(entries, { recursive: true });

/**
 * An app that imports every one of `modules` and uses every part of each.
 * size-limit names every `*` import `all`, so it cannot import several
 * modules in one check: this writes a module that re-exports them all, for
 * the check to import instead.
 */
function together(name, modules) {
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

const production = (library) =>
  library.production && {
    modifyRolldownConfig: inProduction(library.production),
  };

const menhirTogether = (name, components) => ({
  name,
  import: together(
    name,
    components.map((component) => `menhir/${component}`),
  ),
  gzip: true,
  ignore: ["solid-js", "@solidjs/web"],
  modifyRolldownConfig: inProduction(solidProduction),
});

// Each other library's version of a menhir component (comparison.ts),
// measured as .size-limit.js measures menhir's entry points, with the
// library's framework left out instead of Solid, and as its production
// build too (`library.production`). No budgets: these sizes are
// shown, not enforced. The name of a check is the module it measures.
//
// Then the totals (`totalChecks`): each library's components imported
// together, and the same components of menhir, so that code the components
// share is counted once.
export default [
  ...libraries.flatMap((library) =>
    Object.values(library.components).map((module) => ({
      name: module,
      import: { [file(module)]: "*" },
      gzip: true,
      ignore: library.ignore,
      ...production(library),
    })),
  ),
  menhirTogether(totalChecks.menhir, comparedComponents),
  ...libraries
    .filter((library) => Object.keys(library.components).length > 0)
    .flatMap((library) => [
      {
        name: totalChecks.library(library),
        import: together(
          totalChecks.library(library),
          Object.values(library.components),
        ),
        gzip: true,
        ignore: library.ignore,
        ...production(library),
      },
      menhirTogether(
        totalChecks.menhirFor(library),
        // In the order of `comparedComponents`, so that the same components
        // make the same bundle: gzip differs with the order of the code.
        Object.keys(library.components).sort(),
      ),
    ]),
];
