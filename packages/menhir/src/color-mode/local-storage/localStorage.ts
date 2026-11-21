import { parseColorMode, scriptLiteral } from "../colorMode.ts";
import type { ColorModeOptions, ColorModeStorage } from "../colorMode.ts";
import { colorModeScriptWithStorage } from "../colorModeScript.ts";
import { createColorModeWithStorage } from "../createColorMode.ts";
import type { ColorModeState } from "../createColorMode.ts";

/** `localStorage`, which only the browser can read. */
const storage: ColorModeStorage = {
  read: (key) => {
    try {
      return parseColorMode(localStorage.getItem(key));
    } catch {
      // Storage can be unavailable, such as with cookies blocked; the
      // choice then lasts until the page is left.
      return "system";
    }
  },
  write: (key, mode) => {
    try {
      if (mode === "system") localStorage.removeItem(key);
      else localStorage.setItem(key, mode);
    } catch {
      // See read.
    }
  },
  watch: (key, onChange) => {
    const onStorage = (event: StorageEvent) => {
      // A `null` key means the whole storage was cleared.
      if (event.key === key || event.key === null) {
        onChange(parseColorMode(event.newValue));
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  },
  readsOnServer: false,
  script: (key) => `m=localStorage.getItem(${scriptLiteral(key)})`,
};

/**
 * The reader's light, dark or system choice, saved in `localStorage` and
 * applied to `<html>` (`ColorModeOptions.attribute`). Follows the system
 * preference while the choice is `system`, and stays in step with the other
 * instances in this tab and with other tabs.
 *
 * Call it in a component. The saved choice is read once the page has
 * settled, so the server's HTML and the first client render agree; until
 * then the state is `system` and `light`. The head script from
 * `colorModeScript`, with the same options, applies the choice before the
 * first paint, so the page does not flash in between.
 */
export function createColorMode(options?: ColorModeOptions): ColorModeState {
  return createColorModeWithStorage(storage, options);
}

/**
 * The source of a script for the document head that applies the choice
 * saved in `localStorage`, or the system preference, before the page first
 * paints. Pass the options given to `createColorMode`. Render it inline,
 * before any styles that depend on the mode:
 *
 * ```tsx
 * <script innerHTML={colorModeScript()} />
 * ```
 */
export function colorModeScript(options?: ColorModeOptions): string {
  return colorModeScriptWithStorage(storage, options);
}
