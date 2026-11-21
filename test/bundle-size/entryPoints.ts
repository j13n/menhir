import { readFileSync } from "node:fs";

import { popupComponents } from "../../packages/menhir/layers.ts";

const manifest = JSON.parse(
  readFileSync(new URL(import.meta.resolve("menhir/package.json")), "utf8"),
);

/** Every entry point in menhir's `exports`, such as `menhir/switch`. */
export const entryPoints: string[] = Object.keys(manifest.exports)
  .filter((subpath) => subpath !== "./package.json")
  .map((subpath) => `menhir/${subpath.slice("./".length)}`);

/**
 * The entry points of simple components, which must not bundle the
 * `floating` layer: every entry point but the popups (PLAN.md section 6,
 * rule 4).
 */
export const simpleEntryPoints: string[] = entryPoints.filter(
  (entryPoint) => !popupComponents.includes(entryPoint.slice("menhir/".length)),
);
