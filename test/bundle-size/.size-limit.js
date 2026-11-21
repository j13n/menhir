import { fileURLToPath } from "node:url";

// One size budget per entry point of menhir (PLAN.md section 6), measured
// with Rolldown, which drops unused parts as a Vite app does; esbuild keeps
// a whole `export * as` namespace (PLAN.md section 6, rule 3).
const budgets = {
  "menhir/checkbox": "2.4 kB",
  "menhir/color-mode/cookie": "1.7 kB",
  "menhir/color-mode/local-storage": "1.4 kB",
  "menhir/meter": "1.4 kB",
  "menhir/progress": "1.4 kB",
  "menhir/separator": "900 B",
  "menhir/switch": "2.3 kB",
  "menhir/theme/cookie": "1.6 kB",
  "menhir/theme/local-storage": "1.3 kB",
  "menhir/toggle": "1.4 kB",
  "menhir/toggle-group": "2.5 kB",
};

export default Object.entries(budgets).map(([entryPoint, limit]) => ({
  name: entryPoint,
  // An app that imports the entry point and uses every part of it.
  import: { [fileURLToPath(import.meta.resolve(entryPoint))]: "*" },
  limit,
  gzip: true,
  ignore: ["solid-js", "@solidjs/web"],
}));
