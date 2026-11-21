import { localStoragePreference } from "../../core/preference/localStoragePreference.ts";

import type { ColorModeOptions } from "../colorMode.ts";
import { colorModeScriptWithStorage } from "../colorModeScript.ts";
import { createColorModeWithStorage } from "../createColorMode.ts";
import type { ColorModeState } from "../createColorMode.ts";

const storage = localStoragePreference;

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
 *
 * Under a Content Security Policy without `'unsafe-inline'`, put the
 * policy's nonce on the element (`<script nonce={nonce} …>`), or allow the
 * SHA-256 hash of the returned source.
 */
export function colorModeScript(options?: ColorModeOptions): string {
  return colorModeScriptWithStorage(storage, options);
}
