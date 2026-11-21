import { createSignal, onSettled } from "solid-js";
import type { Accessor } from "solid-js";

import {
  darkQuery,
  defaultAttribute,
  defaultStorageKey,
  parseColorMode,
  resolveColorMode,
} from "./colorMode.ts";
import type {
  ColorMode,
  ColorModeOptions,
  ResolvedColorMode,
} from "./colorMode.ts";

export interface ColorModeState {
  /** The reader's choice. `system` until the page has settled. */
  mode: Accessor<ColorMode>;
  /** The look the system prefers. `light` until the page has settled. */
  system: Accessor<ResolvedColorMode>;
  /** The look on screen: `mode`, with `system` replaced by the preference. */
  resolved: Accessor<ResolvedColorMode>;
  /** Saves a new choice and applies it. Call from an event handler. */
  setMode: (mode: ColorMode) => void;
}

/** Tells the other instances in the same tab about a choice. */
const changeEvent = "menhir:color-mode";

interface ChangeDetail {
  storageKey: string;
  mode: ColorMode;
}

/**
 * The reader's light, dark or system choice, saved in `localStorage` and
 * applied to `<html>` (`ColorModeOptions.attribute`). Follows the system
 * preference while the choice is `system`, and stays in step with the other
 * instances in this tab and with other tabs.
 *
 * Call it in a component. The saved choice is read once the page has
 * settled, so the server's HTML and the first client render agree; until
 * then the state is `system` and `light`. The head script from
 * `colorModeScript`, with the same options, applies the choice before the
 * first paint, so the page does not flash in between.
 */
export function createColorMode(
  options: ColorModeOptions = {},
): ColorModeState {
  const storageKey = options.storageKey ?? defaultStorageKey;
  const attribute = options.attribute ?? defaultAttribute;

  const [mode, setModeSignal] = createSignal<ColorMode>("system");
  const [system, setSystem] = createSignal<ResolvedColorMode>("light");

  // Reads lag writes until the next flush, so the DOM is updated from these
  // copies rather than from the signals.
  let currentMode: ColorMode = "system";
  let currentSystem: ResolvedColorMode = "light";

  const update = (next: { mode?: ColorMode; system?: ResolvedColorMode }) => {
    if (next.mode) setModeSignal((currentMode = next.mode));
    if (next.system) setSystem((currentSystem = next.system));
    applyColorMode(resolveColorMode(currentMode, currentSystem), attribute);
  };

  onSettled(() => {
    const media = window.matchMedia(darkQuery);
    update({
      mode: parseColorMode(readStorage(storageKey)),
      system: media.matches ? "dark" : "light",
    });

    const onMediaChange = (event: MediaQueryListEvent) =>
      update({ system: event.matches ? "dark" : "light" });
    const onStorage = (event: StorageEvent) => {
      // A `null` key means the whole storage was cleared.
      if (event.key === storageKey || event.key === null) {
        update({ mode: parseColorMode(event.newValue) });
      }
    };
    const onChange = (event: Event) => {
      const detail = (event as CustomEvent<ChangeDetail>).detail;
      if (detail.storageKey === storageKey) update({ mode: detail.mode });
    };

    media.addEventListener("change", onMediaChange);
    window.addEventListener("storage", onStorage);
    window.addEventListener(changeEvent, onChange);
    return () => {
      media.removeEventListener("change", onMediaChange);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(changeEvent, onChange);
    };
  });

  const setMode = (next: ColorMode) => {
    writeStorage(storageKey, next);
    update({ mode: next });
    window.dispatchEvent(
      new CustomEvent<ChangeDetail>(changeEvent, {
        detail: { storageKey, mode: next },
      }),
    );
  };

  return {
    mode,
    system,
    resolved: () => resolveColorMode(mode(), system()),
    setMode,
  };
}

function applyColorMode(
  resolved: ResolvedColorMode,
  attribute: NonNullable<ColorModeOptions["attribute"]>,
) {
  const root = document.documentElement;
  if (attribute === "class") {
    root.classList.remove(resolved === "dark" ? "light" : "dark");
    root.classList.add(resolved);
  } else {
    root.setAttribute(attribute, resolved);
  }
}

// Storage can be unavailable, such as with cookies blocked; the choice then
// lasts until the page is left.
function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, mode: ColorMode) {
  try {
    if (mode === "system") localStorage.removeItem(key);
    else localStorage.setItem(key, mode);
  } catch {
    // See readStorage.
  }
}
