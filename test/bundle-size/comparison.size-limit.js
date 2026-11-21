import { fileURLToPath } from "node:url";

import { libraries } from "./comparison.ts";

// Each other library's version of a menhir component (comparison.ts),
// measured as .size-limit.js measures menhir's entry points, with the
// library's framework left out instead of Solid. No budgets: these sizes are
// shown, not enforced. The name of a check is the module it measures.
export default libraries.flatMap((library) =>
  Object.values(library.components).map((module) => ({
    name: module,
    import: { [fileURLToPath(import.meta.resolve(module))]: "*" },
    gzip: true,
    ignore: library.ignore,
  })),
);
