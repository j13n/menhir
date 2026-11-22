import { floatingModules } from "../../packages/menhir/layers.ts";
import { findFloatingModules } from "./findFloatingModules.ts";

type FloatingModule = (typeof floatingModules)[number];

/**
 * What a popup may not bundle: a module of the `floating` layer, by its
 * folder in `src/floating`, one file of a module, as `dismissal/outsidePress`,
 * or `@floating-ui`, any of its packages.
 */
export type Forbidden =
  "@floating-ui" | FloatingModule | `${FloatingModule}/${string}`;

/**
 * By popup entry point, what it must not bundle (PLAN.md section 6, rule 6).
 * A row is checked once its popup is in menhir's `exports`; fill one in as
 * each popup lands.
 */
export const forbiddenModules: Record<string, Forbidden[]> = {
  // A dialog is not positioned and does not open on hover.
  "menhir/dialog": ["@floating-ui", "positioning", "hover"],
  // Nor does an alert dialog close on a press outside (#26, #32).
  "menhir/alert-dialog": [
    "@floating-ui",
    "positioning",
    "hover",
    "dismissal/outsidePress",
  ],
  // A tooltip closes on Escape only (#26, #34).
  "menhir/tooltip": [
    "dismissal/outsidePress",
    "dismissal/dialogClose",
    "dismissal/popoverClose",
  ],
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
      : // A folder is followed by `/`, a file by its extension.
        found.some((id) =>
          id.includes(`/floating/${name}${name.includes("/") ? "." : "/"}`),
        ),
  );
}
