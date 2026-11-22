import { fileURLToPath } from "node:url";

import { floatingBudgets } from "./floatingBudgets.ts";
import { inProduction, solidProduction } from "./productionConstants.ts";

// The budgets of floatingBudgets.ts, measured as .size-limit.js measures an
// entry point. The `floating` layer is internal, so its files are reached
// through menhir's folder, not through `exports`.
const dist = new URL(
  "dist/floating/",
  import.meta.resolve("menhir/package.json"),
);

export default Object.entries(floatingBudgets).map(([file, limit]) => ({
  name: `floating/${file}`,
  import: { [fileURLToPath(new URL(`${file}.js`, dist))]: "*" },
  limit,
  gzip: true,
  ignore: ["solid-js", "@solidjs/web"],
  modifyRolldownConfig: inProduction(solidProduction),
}));
