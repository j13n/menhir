import { floatingModules } from "../../packages/menhir/layers.ts";
import { findFloatingModules } from "./findFloatingModules.ts";

/**
 * What a popup may not bundle: a module of the `floating` layer, by its
 * folder in `src/floating`, or `@floating-ui`, any of its packages.
 */
export type Forbidden = "@floating-ui" | (typeof floatingModules)[number];

/**
 * By popup entry point, what it must not bundle (PLAN.md section 6, rule 6).
 * A row is checked once its popup is in menhir's `exports`; fill one in as
 * each popup lands.
 */
export const forbiddenModules: Record<string, Forbidden[]> = {
  // A dialog is not positioned and does not open on hover.
  "menhir/dialog": ["@floating-ui", "positioning", "hover"],
  "menhir/alert-dialog": ["@floating-ui", "positioning", "hover"],
};

/**
 * Bundles an app that imports `specifier` alone, with Rolldown, and returns
 * the entries of `forbidden` it includes, in the order given. An empty list
 * means the popup bundles none of them.
 */
export async function findForbiddenModules(
  specifier: string,
  forbidden: Forbidden[],
): Promise<Forbidden[]> {
  const found = await findFloatingModules(specifier);
  return forbidden.filter((name) =>
    name === "@floating-ui"
      ? found.some((id) => id.startsWith("@floating-ui/"))
      : found.some((id) => id.includes(`/floating/${name}/`)),
  );
}
