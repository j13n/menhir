/**
 * One size budget per file of the `floating` layer that a popup imports,
 * directly or through another module (PLAN.md section 6), keyed by its path under `dist/floating`, such as
 * `"dismissal/escape": "300 B"`. A module has no entry point, so
 * `floating.size-limit.js` measures it as an app that imports the file and
 * uses all of it, the way `.size-limit.js` measures an entry point. The
 * sizes are not published on the docs site; each module's README records
 * its own. The limit is the measured size plus about 20%, rounded.
 */
export const floatingBudgets: Record<string, string> = {
  // positioning/README.md records each size, and what each middleware adds
  // to createPosition, which counts the shared code of @floating-ui/dom.
  "positioning/createPosition": "6650 B",
  "positioning/offset": "700 B",
  "positioning/flip": "1450 B",
  "positioning/shift": "600 B",
  "positioning/size": "1000 B",
  "positioning/arrow": "1050 B",
  "positioning/hide": "650 B",
  // dismissal/README.md records each size.
  "dismissal/dialogClose": "550 B",
  "dismissal/outsidePress": "500 B",
  "dismissal/popoverClose": "650 B",
  "dismissal/escape": "400 B",
  // focus/README.md records each size.
  "focus/tabWrap": "1050 B",
  "focus/tabbable": "650 B",
  "focus/returnFocus": "600 B",
  "focus/initialFocus": "350 B",
  // scroll-lock/README.md records its size.
  "scroll-lock/scrollLock": "950 B",
  // presence/README.md records its size.
  "presence/presence": "650 B",
  // hover/README.md records each size. hover counts the safe area it
  // imports.
  "hover/safeArea": "500 B",
  "hover/hover": "1100 B",
  "hover/group": "300 B",
  // list-navigation/README.md records each size. roving and
  // activeDescendant count listNavigation, which they import.
  "list-navigation/listNavigation": "1150 B",
  "list-navigation/roving": "1200 B",
  "list-navigation/activeDescendant": "1200 B",
};
