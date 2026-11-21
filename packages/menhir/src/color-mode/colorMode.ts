/** The reader's choice: a fixed look, or whatever the system prefers. */
export type ColorMode = "light" | "dark" | "system";

/** The look on screen: a mode with `system` replaced by the preference. */
export type ResolvedColorMode = "light" | "dark";

export interface ColorModeOptions {
  /**
   * The `localStorage` key, or the cookie name, the choice is saved under.
   * Default `"color-mode"`.
   */
  storageKey?: string;
  /**
   * Where the resolved mode goes on `<html>`: a `data-*` attribute set to
   * `light` or `dark` (default `"data-theme"`), or `"class"` for a `light`
   * or `dark` class.
   */
  attribute?: "class" | `data-${string}`;
}

/**
 * Where the choice is saved. Internal: each entry point,
 * `menhir/color-mode/local-storage` and `menhir/color-mode/cookie`, binds
 * one, so an app ships only the storage it uses.
 */
export interface ColorModeStorage {
  /** The saved choice; `system` if there is none or it cannot be read. */
  read: (key: string) => ColorMode;
  /** Saves a choice; `system` removes the saved value. */
  write: (key: string, mode: ColorMode) => void;
  /**
   * Calls `onChange` with the choice when another tab may have changed it.
   * Returns the function that stops listening.
   */
  watch: (key: string, onChange: (mode: ColorMode) => void) => () => void;
  /**
   * Whether `read` works on the server too, so that `createColorMode` can
   * read the choice during the first render without hydration disagreeing.
   */
  readsOnServer: boolean;
  /**
   * The head script's source for reading the choice: statements that set
   * the variable `m` to the saved value. They run inside a `try`, and must
   * not be able to close the script element whatever `key` holds.
   */
  script: (key: string) => string;
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

/** A string as a JavaScript literal that cannot close the script element. */
export function scriptLiteral(value: string): string {
  return JSON.stringify(value).replaceAll("<", "\\u003c");
}
