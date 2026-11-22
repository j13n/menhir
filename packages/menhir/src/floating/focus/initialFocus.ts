import { createEffect } from "solid-js";

import type { FocusTarget } from "./target.ts";

/**
 * Moves focus to `initialFocus` once the popup has opened, instead of where
 * the browser puts it: the element with `autofocus`, else a dialog's first
 * focusable element, while a popover leaves focus on its trigger. Without
 * `initialFocus` the browser decides.
 *
 * ```ts
 * createInitialFocus({
 *   get popup() { return dialog; },
 *   get open() { return open(); },
 *   get initialFocus() { return props.initialFocus; },
 * });
 * ```
 *
 * A function is called on each opening with the element the browser focused
 * inside the popup, or `null` when it focused none. The browser focuses
 * first, so focus moves twice, in the same task, before anything is painted.
 */
export function createInitialFocus(options: {
  readonly popup: HTMLElement | undefined;
  readonly open: boolean;
  readonly initialFocus?: FocusTarget;
}): void {
  createEffect(
    () => options.open,
    (open) => {
      const popup = options.popup;
      if (!open || !popup) return;
      // After the popup's own `showModal()` or `showPopover()` in this
      // flush, whichever effect runs first. A microtask, not `onFlush`,
      // which is for event handlers: this runs inside the flush.
      queueMicrotask(() => {
        if (!popup.matches("[open], :popover-open")) return;
        const active = document.activeElement;
        const target = options.initialFocus;
        (typeof target === "function"
          ? target(popup.contains(active) ? active : null)
          : target
        )?.focus();
      });
    },
  );
}
