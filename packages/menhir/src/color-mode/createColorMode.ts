import { createSignal, onSettled } from "solid-js";
import type { Accessor } from "solid-js";

import { createPreference } from "../core/preference/createPreference.ts";
import type { PreferenceStorage } from "../core/preference/preference.ts";

import {
  resolvedModes,
  darkQuery,
  defaultAttribute,
  defaultStorageKey,
  resolveColorMode,
} from "./colorMode.ts";
import type {
  ColorMode,
  ColorModeOptions,
  ResolvedColorMode,
} from "./colorMode.ts";

export interface ColorModeState {
  /**
   * The reader's choice. `system` until the page has settled, unless it is
   * saved in a cookie (`menhir/color-mode/cookie`).
   */
  mode: Accessor<ColorMode>;
  /** The look the system prefers. `light` until the page has settled. */
  system: Accessor<ResolvedColorMode>;
  /** The look on screen: `mode`, with `system` replaced by the preference. */
  resolved: Accessor<ResolvedColorMode>;
  /** Saves a new choice and applies it. Call from an event handler. */
  setMode: (mode: ColorMode) => void;
}

/**
 * `createColorMode` of each entry point, with the entry point's storage.
 *
 * The reader's light, dark or system choice, saved in `storage` and applied
 * to `<html>` (`ColorModeOptions.attribute`), through `createPreference`.
 * Follows the system preference while the choice is `system`. `system`
 * waits until the page has settled, since the server cannot see it; until
 * then it is `light`.
 */
export function createColorModeWithStorage(
  storage: PreferenceStorage,
  options: ColorModeOptions = {},
): ColorModeState {
  const [system, setSystem] = createSignal<ResolvedColorMode>("light");
  // Reads lag writes until the next flush, so the look is resolved from this
  // copy rather than from the signal.
  let currentSystem: ResolvedColorMode = "light";

  const preference = createPreference<ColorMode>(storage, {
    storageKey: options.storageKey ?? defaultStorageKey,
    attribute: options.attribute ?? defaultAttribute,
    values: resolvedModes,
    unset: "system",
    resolve: (mode) => resolveColorMode(mode, currentSystem),
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
    mode: preference.value,
    system,
    resolved: () => resolveColorMode(preference.value(), system()),
    setMode: preference.set,
  };
}
