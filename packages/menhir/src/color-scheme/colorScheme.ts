import { parsePreference } from "../core/preference/preference.ts";

/** The reader's choice: a fixed look, or whatever the system prefers. */
export type ColorScheme = "light" | "dark" | "system";

/** The look on screen: a scheme with `system` replaced by the preference. */
export type ResolvedColorScheme = "light" | "dark";

export interface ColorSchemeOptions {
  /**
   * The `localStorage` key, or the cookie name, the choice is saved under.
   * Default `"color-scheme"`.
   */
  storageKey?: string;
  /**
   * Where the resolved scheme goes on `<html>`: a `data-*` attribute set to
   * `light` or `dark` (default `"data-color-scheme"`), or `"class"` for a `light`
   * or `dark` class.
   */
  attribute?: "class" | `data-${string}`;
}

export const defaultStorageKey = "color-scheme";

/** The fixed schemes: every value that is saved, and every look. */
export const resolvedSchemes: readonly ResolvedColorScheme[] = [
  "light",
  "dark",
];
export const defaultAttribute = "data-color-scheme";

/** The media query whose match means the system prefers dark. */
export const darkQuery = "(prefers-color-scheme: dark)";

/** `scheme` as it looks when the system prefers `system`. */
export function resolveColorScheme(
  scheme: ColorScheme,
  system: ResolvedColorScheme,
): ResolvedColorScheme {
  return scheme === "system" ? system : scheme;
}

/**
 * The scheme a single cycling toggle moves to next, so that a click from
 * `system` always changes the look: `system`, then the opposite of the
 * system's look, then the system's look, then `system` again. Three schemes
 * share two looks, so one click per round leaves the look as it is: the one
 * back to `system`.
 */
export function nextColorScheme(
  scheme: ColorScheme,
  system: ResolvedColorScheme,
): ColorScheme {
  if (scheme === "system") return system === "dark" ? "light" : "dark";
  return scheme === system ? "system" : system;
}

/** A stored value as a scheme; anything else, including none, is `system`. */
export function parseColorScheme(
  value: string | null | undefined,
): ColorScheme {
  return parsePreference<ColorScheme>(value, resolvedSchemes, "system");
}
