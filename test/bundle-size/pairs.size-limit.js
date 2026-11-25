import { pairChecks, pairs } from "./pairs.ts";
import { menhirTogether } from "./together.ts";

// Each component that builds on another (`popupBases` and `simpleBases` in
// packages/menhir/layers.ts), imported with its base, and each base alone,
// measured as .size-limit.js measures an entry point. The base alone goes
// through the same re-exporting module as the pair, so the two differ only
// by the component. No limits: pairSize.test.ts compares the two sizes with
// the pair's margin.
const bases = [...new Set(pairs.map((pair) => pair.base))];

export default [
  ...bases.map((base) => menhirTogether(pairChecks.base(base), [base])),
  ...pairs.map((pair) =>
    menhirTogether(pairChecks.together(pair), [pair.base, pair.component]),
  ),
];
