/** The reader's choice: a fixed look, or whatever the system prefers. */
export type ColorMode = "light" | "dark" | "system";

/** The look on screen: a mode with `system` replaced by the preference. */
export type ResolvedColorMode = "light" | "dark";

export interface ColorModeOptions {
  /** The `localStorage` key the choice is saved under. Default `"color-mode"`. */
  storageKey?: string;
  /**
   * Where the resolved mode goes on `<html>`: a `data-*` attribute set to
   * `light` or `dark` (default `"data-theme"`), or `"class"` for a `light`
   * or `dark` class.
   */
  attribute?: "class" | `data-${string}`;
}

export const defaultStorageKey = "color-mode";
export const defaultAttribute = "data-theme";

/** The media query whose match means the system prefers dark. */
export const darkQuery = "(prefers-color-scheme: dark)";

/** `mode` as it looks when the system prefers `system`. */
export function resolveColorMode(
  mode: ColorMode,
  system: ResolvedColorMode,
): ResolvedColorMode {
  return mode === "system" ? system : mode;
}

/**
 * The mode a single cycling toggle moves to next, so that a click from
 * `system` always changes the look: `system`, then the opposite of the
 * system's look, then the system's look, then `system` again. Three modes
 * share two looks, so one click per round leaves the look as it is: the one
 * back to `system`.
 */
export function nextColorMode(
  mode: ColorMode,
  system: ResolvedColorMode,
): ColorMode {
  if (mode === "system") return system === "dark" ? "light" : "dark";
  return mode === system ? "system" : system;
}

/** A stored value as a mode; anything else, including none, is `system`. */
export function parseColorMode(value: string | null | undefined): ColorMode {
  return value === "light" || value === "dark" ? value : "system";
}
