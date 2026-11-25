import {
  comparedComponents,
  libraries,
  moduleName,
  totalChecks,
} from "./comparison.ts";
import { inProduction } from "./productionConstants.ts";
import { file, menhirTogether, together } from "./together.ts";

const production = (library) =>
  library.production && {
    modifyRolldownConfig: inProduction(library.production),
  };

// Each other library's version of a menhir component (comparison.ts),
// measured as .size-limit.js measures menhir's entry points, with the
// library's framework left out instead of Solid, and as its production
// build too (`library.production`). No budgets: these sizes are
// shown, not enforced. The name of a check is the module it measures, or
// the modules it imports together, joined by " + " (`moduleName`).
//
// Then the totals (`totalChecks`): each library's components imported
// together, and the same components of menhir, so that code the components
// share is counted once.
export default [
  ...libraries.flatMap((library) =>
    Object.values(library.components).map((modules) => ({
      name: moduleName(modules),
      import:
        typeof modules === "string"
          ? { [file(modules)]: "*" }
          : together(moduleName(modules), modules),
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
          Object.values(library.components).flat(),
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
