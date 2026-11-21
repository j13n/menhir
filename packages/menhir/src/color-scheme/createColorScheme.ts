import { createSignal, onSettled } from "solid-js";
import type { Accessor } from "solid-js";

import { createPreference } from "../core/preference/createPreference.ts";
import type { PreferenceStorage } from "../core/preference/preference.ts";

import {
  resolvedSchemes,
  darkQuery,
  defaultAttribute,
  defaultStorageKey,
  resolveColorScheme,
} from "./colorScheme.ts";
import type {
  ColorScheme,
  ColorSchemeOptions,
  ResolvedColorScheme,
} from "./colorScheme.ts";

export interface ColorSchemeState {
  /**
   * The reader's choice. `system` until the page has settled, unless it is
   * saved in a cookie (`menhir/color-scheme/cookie`).
   */
  scheme: Accessor<ColorScheme>;
  /** The look the system prefers. `light` until the page has settled. */
  system: Accessor<ResolvedColorScheme>;
  /** The look on screen: `scheme`, with `system` replaced by the preference. */
  resolved: Accessor<ResolvedColorScheme>;
  /** Saves a new choice and applies it. Call from an event handler. */
  setScheme: (scheme: ColorScheme) => void;
}

/**
 * `createColorScheme` of each entry point, with the entry point's storage.
 *
 * The reader's light, dark or system choice, saved in `storage` and applied
 * to `<html>` (`ColorSchemeOptions.attribute`), through `createPreference`.
 * Follows the system preference while the choice is `system`. `system`
 * waits until the page has settled, since the server cannot see it; until
 * then it is `light`.
 */
export function createColorSchemeWithStorage(
  storage: PreferenceStorage,
  options: ColorSchemeOptions = {},
): ColorSchemeState {
  const [system, setSystem] = createSignal<ResolvedColorScheme>("light");
  // Reads lag writes until the next flush, so the look is resolved from this
  // copy rather than from the signal.
  let currentSystem: ResolvedColorScheme = "light";

  const preference = createPreference<ColorScheme>(storage, {
    storageKey: options.storageKey ?? defaultStorageKey,
    attribute: options.attribute ?? defaultAttribute,
    values: resolvedSchemes,
    unset: "system",
    resolve: (scheme) => resolveColorScheme(scheme, currentSystem),
  });

  // Applies the look again whenever the system is read, so it is right
  // whether this runs before or after the preference reads the saved
  // choice; both happen as the page settles, before it paints.
  onSettled(() => {
    const media = window.matchMedia(darkQuery);
    const onMediaChange = () => {
      setSystem((currentSystem = media.matches ? "dark" : "light"));
      preference.apply();
    };
    onMediaChange();
    media.addEventListener("change", onMediaChange);
    return () => media.removeEventListener("change", onMediaChange);
  });

  return {
    scheme: preference.value,
    system,
    resolved: () => resolveColorScheme(preference.value(), system()),
    setScheme: preference.set,
  };
}
