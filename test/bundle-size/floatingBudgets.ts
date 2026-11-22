/**
 * One size budget per file of the `floating` layer that a popup imports
 * (PLAN.md section 6), keyed by its path under `dist/floating`, such as
 * `"dismissal/escape": "300 B"`. A module has no entry point, so
 * `floating.size-limit.js` measures it as an app that imports the file and
 * uses all of it, the way `.size-limit.js` measures an entry point. The
 * sizes are not published on the docs site; each module's README records
 * its own. The limit is the measured size plus about 20%, rounded.
 */
export const floatingBudgets: Record<string, string> = {};
