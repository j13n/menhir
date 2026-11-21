import { localStoragePreference } from "../../core/preference/localStoragePreference.ts";

import { createThemeWithStorage, themeScriptWithStorage } from "../theme.ts";
import type { ThemeOptions, ThemeState } from "../theme.ts";

const storage = localStoragePreference;

/**
 * The reader's choice of theme, saved in `localStorage` and applied to
 * `<html>` (`ThemeOptions.attribute`). Stays in step with the other
 * instances in this tab, and with other tabs.
 *
 * Call it in a component. The saved theme is read once the page has
 * settled, so the server's HTML and the first client render agree; until
 * then the theme is the default. The head script from `themeScript`, with
 * the same options, applies the saved theme before the first paint, so the
 * page does not flash in between.
 */
export function createTheme<const T extends string>(
  options: ThemeOptions<T>,
): ThemeState<T> {
  return createThemeWithStorage(storage, options);
}

/**
 * The source of a script for the document head that applies the theme
 * saved in `localStorage`, or the default, before the page first paints.
 * Pass the options given to `createTheme`. Render it inline, before any
 * styles that depend on the theme:
 *
 * ```tsx
 * <script innerHTML={themeScript(options)} />
 * ```
 *
 * Under a Content Security Policy without `'unsafe-inline'`, put the
 * policy's nonce on the element (`<script nonce={nonce} …>`), or allow the
 * SHA-256 hash of the returned source.
 */
export function themeScript<const T extends string>(
  options: ThemeOptions<T>,
): string {
  return themeScriptWithStorage(storage, options);
}
