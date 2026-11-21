import { isDev } from "@solidjs/web";
import type { Accessor } from "solid-js";

import { createPreference } from "../core/preference/createPreference.ts";
import type {
  PreferenceAttribute,
  PreferenceStorage,
} from "../core/preference/preference.ts";
import {
  parsePreference,
  scriptLiteral,
} from "../core/preference/preference.ts";
import { preferenceScript } from "../core/preference/preferenceScript.ts";

export interface ThemeOptions<T extends string> {
  /** Every theme the reader can choose, such as `["paper", "nord"]`. */
  themes: readonly T[];
  /** The theme while the reader has chosen none. One of `themes`. */
  defaultTheme: NoInfer<T>;
  /**
   * The `localStorage` key, or the cookie name, the choice is saved under.
   * Default `"theme"`.
   */
  storageKey?: string;
  /**
   * Where the theme goes on `<html>`: a `data-*` attribute set to its name
   * (default `"data-theme"`), or `"class"` for a class named after it.
   */
  attribute?: PreferenceAttribute;
}

export interface ThemeState<T extends string> {
  /**
   * The reader's theme. The default until the page has settled, unless it
   * is saved in a cookie (`menhir/theme/cookie`).
   */
  theme: Accessor<T>;
  /**
   * Saves a theme and applies it. Choosing the default removes the saved
   * value. Call from an event handler.
   */
  setTheme: (theme: T) => void;
}

export const defaultStorageKey = "theme";
export const defaultAttribute = "data-theme";

/**
 * Throws for options the head script could not apply. Production builds
 * drop the check, and its messages, with `isDev`.
 */
function checkThemes(options: ThemeOptions<string>) {
  for (const theme of options.themes) {
    // A class cannot hold a space, and a cookie value is saved encoded,
    // which the head script does not undo.
    if (!/^[\w-]+$/.test(theme)) {
      throw new Error(
        `[menhir] The theme ${JSON.stringify(theme)} needs a name of letters, digits, "-" and "_".`,
      );
    }
  }
  if (!options.themes.includes(options.defaultTheme)) {
    throw new Error(
      `[menhir] The defaultTheme ${JSON.stringify(options.defaultTheme)} is not one of themes.`,
    );
  }
}

/** A saved value as a theme: one of `themes`, or else the default. */
export function parseTheme<T extends string>(
  value: string | null | undefined,
  options: ThemeOptions<T>,
): T {
  return parsePreference(value, options.themes, options.defaultTheme);
}

/**
 * `createTheme` of each entry point, with the entry point's storage: the
 * reader's theme, saved in `storage` and applied to `<html>`, through
 * `createPreference`.
 */
export function createThemeWithStorage<T extends string>(
  storage: PreferenceStorage,
  options: ThemeOptions<T>,
): ThemeState<T> {
  if (isDev) checkThemes(options);
  const preference = createPreference<T>(storage, {
    storageKey: options.storageKey ?? defaultStorageKey,
    attribute: options.attribute ?? defaultAttribute,
    values: options.themes,
    unset: options.defaultTheme,
  });
  return { theme: preference.value, setTheme: preference.set };
}

/**
 * `themeScript` of each entry point, with the entry point's storage: the
 * source of a script for the document head that applies the saved theme,
 * or the default, before the page first paints.
 */
export function themeScriptWithStorage<T extends string>(
  storage: PreferenceStorage,
  options: ThemeOptions<T>,
): string {
  if (isDev) checkThemes(options);
  return preferenceScript(storage, {
    storageKey: options.storageKey ?? defaultStorageKey,
    attribute: options.attribute ?? defaultAttribute,
    values: options.themes,
    fallback: scriptLiteral(options.defaultTheme),
  });
}
