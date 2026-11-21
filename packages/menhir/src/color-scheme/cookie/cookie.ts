import {
  cookiePreference,
  cookieValue,
} from "../../core/preference/cookiePreference.ts";

import { defaultStorageKey, parseColorScheme } from "../colorScheme.ts";
import type { ColorScheme, ColorSchemeOptions } from "../colorScheme.ts";
import { colorSchemeScriptWithStorage } from "../colorSchemeScript.ts";
import { createColorSchemeWithStorage } from "../createColorScheme.ts";
import type { ColorSchemeState } from "../createColorScheme.ts";

const storage = cookiePreference;

/**
 * The reader's light, dark or system choice, saved in a cookie and applied
 * to `<html>` (`ColorSchemeOptions.attribute`). Follows the system preference
 * while the choice is `system`, and stays in step with the other instances
 * in this tab, and with other tabs once they are shown again.
 *
 * Call it in a component. The cookie is read during the first render, on
 * the server from the request (`getRequestEvent()`), so the server's HTML
 * shows the choice and hydration agrees. Only `system` waits until the page
 * has settled, since the server cannot see the system's preference. The
 * page has to be rendered for each request: a prerendered page has no
 * cookie to read. The head script from `colorSchemeScript`, with the same
 * options, applies a `system` choice before the first paint.
 */
export function createColorScheme(
  options?: ColorSchemeOptions,
): ColorSchemeState {
  return createColorSchemeWithStorage(storage, options);
}

/**
 * The source of a script for the document head that applies the choice
 * saved in the cookie, or the system preference, before the page first
 * paints. Pass the options given to `createColorScheme`. Render it inline,
 * before any styles that depend on the scheme, even when the server renders
 * the choice: it is what applies `system`.
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

/**
 * The scheme saved in a `Cookie` request header, for a server that puts the
 * attribute on its own `<html>`. Pass the options given to
 * `createColorScheme`.
 */
export function colorSchemeFromCookie(
  cookieHeader: string | null | undefined,
  options: Pick<ColorSchemeOptions, "storageKey"> = {},
): ColorScheme {
  return parseColorScheme(
    cookieValue(cookieHeader, options.storageKey ?? defaultStorageKey),
  );
}
