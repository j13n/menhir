// The components that build on another, with the margin each may cost over
// its base (packages/menhir/layers.ts), for pairs.size-limit.js and
// pairSize.test.ts.
import {
  popupBaseMargins,
  popupBases,
  simpleBaseMargins,
  simpleBases,
} from "../../packages/menhir/layers.ts";

export type Pair = {
  /** By folder in src, such as `context-menu`. */
  component: string;
  /** The component it builds on, such as `menu`. */
  base: string;
  /** In bytes, gzipped. */
  margin: number;
};

const pairsOf = <Component extends string>(
  bases: Record<Component, string>,
  margins: Record<Component, number>,
): Pair[] =>
  (Object.entries(bases) as [Component, string][]).map(([component, base]) => ({
    component,
    base,
    margin: margins[component],
  }));

/** Every pair of `popupBases` and `simpleBases`. */
export const pairs: Pair[] = [
  ...pairsOf(popupBases, popupBaseMargins),
  ...pairsOf(simpleBases, simpleBaseMargins),
];

/** The names of the checks in pairs.size-limit.js. */
export const pairChecks = {
  /** The base alone, such as `menhir/menu alone`. */
  base: (base: string) => `menhir/${base} alone`,
  /** The base and the component imported together. */
  together: (pair: Pair) => `menhir/${pair.base} + menhir/${pair.component}`,
};
