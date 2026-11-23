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
  // A dialog is not positioned, does not open on hover and has no list
  // (#97), so no typeahead (#98).
  "menhir/dialog": [
    "@floating-ui",
    "positioning",
    "hover",
    "list-navigation",
    "typeahead",
  ],
  // Nor does an alert dialog close on a press outside (#26, #32).
  "menhir/alert-dialog": [
    "@floating-ui",
    "positioning",
    "hover",
    "list-navigation",
    "typeahead",
    "dismissal/outsidePress",
  ],
  // A popover is non-modal: it keeps the browser's Tab order (#27, #33) and
  // leaves the page scrolling (#28). It does not open on hover, and the
  // browser closes it, so it needs neither a dialog's dismissal nor
  // Tooltip's Escape (#26). A modal popup is a Dialog (#33). It has no
  // list (#97), so no typeahead (#98).
  "menhir/popover": [
    "list-navigation",
    "typeahead",
    "focus/tabWrap",
    "focus/tabbable",
    "scroll-lock",
    "hover",
    "dismissal/outsidePress",
    "dismissal/dialogClose",
    "dismissal/escape",
  ],
  // A tooltip closes on Escape only (#26, #34), takes no focus (#27),
  // leaves the page scrolling (#28) and has no list (#97), so no typeahead
  // (#98).
  "menhir/tooltip": [
    "list-navigation",
    "typeahead",
    "dismissal/outsidePress",
    "dismissal/dialogClose",
    "dismissal/popoverClose",
    "focus/tabWrap",
    "focus/tabbable",
    "scroll-lock",
  ],
  // A menu is non-modal (#33): it keeps the browser's Tab order and leaves
  // the page scrolling. The browser closes it on Escape and a press
  // outside, so it needs neither a dialog's dismissal nor Tooltip's
  // Escape. Focus moves to its items, so no `aria-activedescendant` list,
  // and a submenu opens on hover with the safe area alone, no delays or
  // group of `hover.ts` (#99).
  "menhir/menu": [
    "focus/tabWrap",
    "focus/tabbable",
    "focus/initialFocus",
    "scroll-lock",
    "dismissal/outsidePress",
    "dismissal/dialogClose",
    "dismissal/escape",
    "hover/hover",
    "hover/group",
    "list-navigation/activeDescendant",
  ],
  // A context menu is Menu's, opened by the `contextmenu` event (#100).
  "menhir/context-menu": [
    "focus/tabWrap",
    "focus/tabbable",
    "focus/initialFocus",
    "scroll-lock",
    "dismissal/outsidePress",
    "dismissal/dialogClose",
    "dismissal/escape",
    "hover/hover",
    "hover/group",
    "list-navigation/activeDescendant",
  ],
  // A menubar's menus are Menu's, opened from the bar (#101). A menu opens
  // on hover only while another is open, with no delay, so no `hover.ts`
  // or group.
  "menhir/menubar": [
    "focus/tabWrap",
    "focus/tabbable",
    "focus/initialFocus",
    "scroll-lock",
    "dismissal/outsidePress",
    "dismissal/dialogClose",
    "dismissal/escape",
    "hover/hover",
    "hover/group",
    "list-navigation/activeDescendant",
  ],
  // A select is non-modal, as a menu is, and the browser closes it. Focus
  // stays on its Trigger, which names the active item, so it has no roving
  // list and nothing returns or sets focus; it opens on no hover (#102).
  "menhir/select": [
    "focus",
    "scroll-lock",
    "hover",
    "dismissal/outsidePress",
    "dismissal/dialogClose",
    "dismissal/escape",
    "list-navigation/roving",
  ],
  // A combobox's Popup is a manual popover: Escape and focus leaving reach
  // its input, which closes it, so it needs no dismissal. Focus stays in the
  // input, which names the active item, and typing filters, so it has no
  // roving list and no typeahead; it opens on no hover (#103).
  "menhir/combobox": [
    "focus",
    "scroll-lock",
    "hover",
    "dismissal",
    "typeahead",
    "list-navigation/roving",
  ],
  // An autocomplete is a combobox whose text is its value: Combobox's
  // parts, so the same modules (#104).
  "menhir/autocomplete": [
    "focus",
    "scroll-lock",
    "hover",
    "dismissal",
    "typeahead",
    "list-navigation/roving",
  ],
  // A navigation menu's Panels are in the page's flow, not the top layer:
  // nothing positions, shows or hides them but `hidden`, and the Root
  // writes its own outside press and closes the others itself (#105).
  "menhir/navigation-menu": [
    "@floating-ui",
    "positioning",
    "presence",
    "focus",
    "scroll-lock",
    "list-navigation",
    "typeahead",
    "hover/group",
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
