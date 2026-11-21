import {
  cookiePreference,
  cookieValue,
} from "../../core/preference/cookiePreference.ts";

import { defaultStorageKey, parseColorMode } from "../colorMode.ts";
import type { ColorMode, ColorModeOptions } from "../colorMode.ts";
import { colorModeScriptWithStorage } from "../colorModeScript.ts";
import { createColorModeWithStorage } from "../createColorMode.ts";
import type { ColorModeState } from "../createColorMode.ts";

const storage = cookiePreference;

/**
 * The reader's light, dark or system choice, saved in a cookie and applied
 * to `<html>` (`ColorModeOptions.attribute`). Follows the system preference
 * while the choice is `system`, and stays in step with the other instances
 * in this tab, and with other tabs once they are shown again.
 *
 * Call it in a component. The cookie is read during the first render, on
 * the server from the request (`getRequestEvent()`), so the server's HTML
 * shows the choice and hydration agrees. Only `system` waits until the page
 * has settled, since the server cannot see the system's preference. The
 * page has to be rendered for each request: a prerendered page has no
 * cookie to read. The head script from `colorModeScript`, with the same
 * options, applies a `system` choice before the first paint.
 */
export function createColorMode(options?: ColorModeOptions): ColorModeState {
  return createColorModeWithStorage(storage, options);
}

/**
 * The source of a script for the document head that applies the choice
 * saved in the cookie, or the system preference, before the page first
 * paints. Pass the options given to `createColorMode`. Render it inline,
 * before any styles that depend on the mode, even when the server renders
 * the choice: it is what applies `system`.
 *
 * ```tsx
 * <script innerHTML={colorModeScript()} />
 * ```
 */
export function colorModeScript(options?: ColorModeOptions): string {
  return colorModeScriptWithStorage(storage, options);
}

/**
 * The mode saved in a `Cookie` request header, for a server that puts the
 * attribute on its own `<html>`. Pass the options given to
 * `createColorMode`.
 */
export function colorModeFromCookie(
  cookieHeader: string | null | undefined,
  options: Pick<ColorModeOptions, "storageKey"> = {},
): ColorMode {
  return parseColorMode(
    cookieValue(cookieHeader, options.storageKey ?? defaultStorageKey),
  );
}
