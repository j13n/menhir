import { createSignal, onSettled } from "solid-js";
import type { Accessor } from "solid-js";

import {
  darkQuery,
  defaultAttribute,
  defaultStorageKey,
  resolveColorMode,
} from "./colorMode.ts";
import type {
  ColorMode,
  ColorModeOptions,
  ColorModeStorage,
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

/** Tells the other instances in the same tab about a choice. */
const changeEvent = "menhir:color-mode";

interface ChangeDetail {
  storageKey: string;
  mode: ColorMode;
}

/**
 * `createColorMode` of each entry point, with the entry point's storage.
 *
 * The reader's light, dark or system choice, saved in `storage` and applied
 * to `<html>` (`ColorModeOptions.attribute`). Follows the system preference
 * while the choice is `system`, and stays in step with the other instances
 * in this tab and with other tabs.
 *
 * A storage only the browser can read, such as `localStorage`, is read once
 * the page has settled, so the server's HTML and the first client render
 * agree; until then the state is `system` and `light`. One the server can
 * read too, such as a cookie, is read during the first render, so only
 * `system` waits. The head script applies the choice before the first
 * paint, so the page does not flash in between.
 */
export function createColorModeWithStorage(
  storage: ColorModeStorage,
  options: ColorModeOptions = {},
): ColorModeState {
  const storageKey = options.storageKey ?? defaultStorageKey;
  const attribute = options.attribute ?? defaultAttribute;

  // Storage the server can read too, such as a cookie, gives the first
  // render the choice; `localStorage` waits until the page has settled.
  const initialMode: ColorMode = storage.readsOnServer
    ? storage.read(storageKey)
    : "system";
  const [mode, setModeSignal] = createSignal<ColorMode>(initialMode);
  const [system, setSystem] = createSignal<ResolvedColorMode>("light");

  // Reads lag writes until the next flush, so the DOM is updated from these
  // copies rather than from the signals.
  let currentMode: ColorMode = initialMode;
  let currentSystem: ResolvedColorMode = "light";

  const update = (next: { mode?: ColorMode; system?: ResolvedColorMode }) => {
    if (next.mode) setModeSignal((currentMode = next.mode));
    if (next.system) setSystem((currentSystem = next.system));
    applyColorMode(resolveColorMode(currentMode, currentSystem), attribute);
  };

  onSettled(() => {
    const media = window.matchMedia(darkQuery);
    update({
      mode: storage.read(storageKey),
      system: media.matches ? "dark" : "light",
    });

    const onMediaChange = (event: MediaQueryListEvent) =>
      update({ system: event.matches ? "dark" : "light" });
    const onChange = (event: Event) => {
      const detail = (event as CustomEvent<ChangeDetail>).detail;
      if (detail.storageKey === storageKey) update({ mode: detail.mode });
    };

    media.addEventListener("change", onMediaChange);
    const unwatch = storage.watch(storageKey, (mode) => update({ mode }));
    window.addEventListener(changeEvent, onChange);
    return () => {
      media.removeEventListener("change", onMediaChange);
      unwatch();
      window.removeEventListener(changeEvent, onChange);
    };
  });

  const setMode = (next: ColorMode) => {
    storage.write(storageKey, next);
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
