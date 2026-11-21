import {
  cookiePreference,
  cookieValue,
} from "../../core/preference/cookiePreference.ts";

import {
  createThemeWithStorage,
  defaultStorageKey,
  parseTheme,
  themeScriptWithStorage,
} from "../theme.ts";
import type { ThemeOptions, ThemeState } from "../theme.ts";

const storage = cookiePreference;

/**
 * The reader's choice of theme, saved in a cookie and applied to
 * `<html>` (`ThemeOptions.attribute`). Stays in step with the other
 * instances in this tab, and with other tabs once they are shown again.
 *
 * Call it in a component. The cookie is read during the first render, on
 * the server from the request (`getRequestEvent()`), so the server's HTML
 * shows the theme and hydration agrees. The page has to be rendered for
 * each request: a prerendered page has no cookie to read.
 */
export function createTheme<const T extends string>(
  options: ThemeOptions<T>,
): ThemeState<T> {
  return createThemeWithStorage(storage, options);
}

/**
 * The source of a script for the document head that applies the theme
 * saved in the cookie, or the default, before the page first paints. Pass
 * the options given to `createTheme`. Render it inline, before any styles
 * that depend on the theme. With the theme rendered on the server, it only
 * applies what the server rendered, and can be left out.
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

/**
 * The theme saved in a `Cookie` request header, or the default, for a
 * server that puts the attribute on its own `<html>`. Pass the options
 * given to `createTheme`.
 */
export function themeFromCookie<const T extends string>(
  cookieHeader: string | null | undefined,
  options: ThemeOptions<T>,
): T {
  return parseTheme(
    cookieValue(cookieHeader, options.storageKey ?? defaultStorageKey),
    options,
  );
}
