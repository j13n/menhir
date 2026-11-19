import { fileURLToPath } from "node:url";

// One size budget per entry point of menhir (PLAN.md section 6), measured
// with Rolldown, which drops unused parts as a Vite app does; esbuild keeps
// a whole namespace (docs/research/base-ui-ports.md).
const budgets = {
  "menhir/switch": "500 B",
};

export default Object.entries(budgets).map(([entryPoint, limit]) => ({
  name: entryPoint,
  // An app that imports the entry point and uses every part of it.
  import: { [fileURLToPath(import.meta.resolve(entryPoint))]: "*" },
  limit,
  gzip: true,
  ignore: ["solid-js", "@solidjs/web"],
}));
