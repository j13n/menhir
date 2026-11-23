import { fileURLToPath } from "node:url";

import { inProduction, solidProduction } from "./productionConstants.ts";

// One size budget per entry point of menhir (PLAN.md section 6), measured
// with Rolldown, which drops unused parts as a Vite app does; esbuild keeps
// a whole `export * as` namespace (PLAN.md section 6, rule 3). Solid is left
// out, but as its production build: the code behind `isDev` and `isServer`
// is not in a production app, so it is not counted (rule 2).
const budgets = {
  "menhir/accordion": "1.8 kB",
  "menhir/alert-dialog": "4.1 kB",
  "menhir/autocomplete": "11.5 kB",
  "menhir/checkbox": "2 kB",
  "menhir/collapsible": "1.5 kB",
  "menhir/color-scheme/cookie": "1.7 kB",
  "menhir/color-scheme/local-storage": "1.4 kB",
  "menhir/combobox": "12.5 kB",
  "menhir/context-menu": "13 kB",
  "menhir/dialog": "4.2 kB",
  "menhir/field": "1.8 kB",
  "menhir/form": "1.1 kB",
  "menhir/form/standard-schema": "300 B",
  "menhir/input": "950 B",
  "menhir/menu": "13.5 kB",
  "menhir/menubar": "13.5 kB",
  "menhir/meter": "1.3 kB",
  "menhir/navigation-menu": "3 kB",
  "menhir/popover": "11.5 kB",
  "menhir/progress": "1.4 kB",
  "menhir/select": "12.5 kB",
  "menhir/separator": "900 B",
  "menhir/switch": "1.9 kB",
  "menhir/tabs": "2.4 kB",
  "menhir/theme/cookie": "1.4 kB",
  "menhir/theme/local-storage": "1.2 kB",
  "menhir/toggle": "1.2 kB",
  "menhir/toggle-group": "2.3 kB",
  "menhir/tooltip": "11.5 kB",
};

export default Object.entries(budgets).map(([entryPoint, limit]) => ({
  name: entryPoint,
  // An app that imports the entry point and uses every part of it.
  import: { [fileURLToPath(import.meta.resolve(entryPoint))]: "*" },
  limit,
  gzip: true,
  ignore: ["solid-js", "@solidjs/web"],
  modifyRolldownConfig: inProduction(solidProduction),
}));
