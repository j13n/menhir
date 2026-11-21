import { localStoragePreference } from "../../core/preference/localStoragePreference.ts";

import type { ColorSchemeOptions } from "../colorScheme.ts";
import { colorSchemeScriptWithStorage } from "../colorSchemeScript.ts";
import { createColorSchemeWithStorage } from "../createColorScheme.ts";
import type { ColorSchemeState } from "../createColorScheme.ts";

const storage = localStoragePreference;

/**
 * The reader's light, dark or system choice, saved in `localStorage` and
 * applied to `<html>` (`ColorSchemeOptions.attribute`). Follows the system
 * preference while the choice is `system`, and stays in step with the other
 * instances in this tab and with other tabs.
 *
 * Call it in a component. The saved choice is read once the page has
 * settled, so the server's HTML and the first client render agree; until
 * then the state is `system` and `light`. The head script from
 * `colorSchemeScript`, with the same options, applies the choice before the
 * first paint, so the page does not flash in between.
 */
export function createColorScheme(
  options?: ColorSchemeOptions,
): ColorSchemeState {
  return createColorSchemeWithStorage(storage, options);
}

/**
 * The source of a script for the document head that applies the choice
 * saved in `localStorage`, or the system preference, before the page first
 * paints. Pass the options given to `createColorScheme`. Render it inline,
 * before any styles that depend on the scheme:
 *
 * ```tsx
 * <script innerHTML={colorSchemeScript()} />
 * ```
 *
 * Under a Content Security Policy without `'unsafe-inline'`, put the
 * policy's nonce on the element (`<script nonce={nonce} …>`), or allow the
 * SHA-256 hash of the returned source.
 */
export function colorSchemeScript(options?: ColorSchemeOptions): string {
  return colorSchemeScriptWithStorage(storage, options);
}
