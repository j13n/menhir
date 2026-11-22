import { createEffect, onCleanup } from "solid-js";

import type { FocusTarget } from "./target.ts";

/**
 * Moves focus to `returnFocus` once the popup has closed, instead of where
 * the browser puts it: the element focused before a dialog opened, or a
 * popover's trigger when focus was inside it. Without `returnFocus` the
 * browser decides.
 *
 * ```ts
 * createReturnFocus({
 *   get popup() { return dialog; },
 *   get open() { return open(); },
 *   get returnFocus() { return props.returnFocus; },
 * });
 * ```
 *
 * A focus the user moved out of the popup while it was shown, such as a
 * press on another button that closed a popover, stays where it is. Focus
 * returns once the popup is closed, not when its state turns false: after
 * the flush that closed it, or on its `close` or `toggle` event if it is
 * still shown then, as while an exit animation runs. A popup disposed while
 * open moves no focus.
 */
export function createReturnFocus(options: {
  readonly popup: HTMLElement | undefined;
  readonly open: boolean;
  readonly returnFocus?: FocusTarget;
}): void {
  // Ends the listening of the last opening, if its popup has not closed.
  // Disposal ends it at once, before the check queued below runs, so a
  // popup disposed while open moves no focus.
  let stop: (() => void) | undefined;
  onCleanup(() => stop?.());
  createEffect(
    () => options.open,
    (open) => {
      const popup = options.popup;
      if (!open || !popup) return;
      // Opened again before the last closing finished.
      stop?.();
      let movedOut = false;
      // The browser's own restore comes once the popup is hidden, so only
      // a focus that moves while it is shown counts.
      const focusin = (event: FocusEvent) => {
        if (isShown(popup)) movedOut = !popup.contains(event.target as Node);
      };
      const finish = () => {
        stop!();
        if (movedOut) return;
        // Where the browser left focus: nowhere if on the body, or still on
        // an element inside the hidden popup, where nothing took it back.
        const active = document.activeElement;
        const focused =
          active === document.body || popup.contains(active) ? null : active;
        const target = options.returnFocus;
        (typeof target === "function" ? target(focused) : target)?.focus();
      };
      const closed = (event: Event) => {
        if ((event as ToggleEvent).newState !== "open") finish();
      };
      stop = () => {
        stop = undefined;
        document.removeEventListener("focusin", focusin);
        popup.removeEventListener("close", closed);
        popup.removeEventListener("toggle", closed);
      };
      document.addEventListener("focusin", focusin);
      popup.addEventListener("close", closed);
      popup.addEventListener("toggle", closed);
      // On close, and on disposal, which ends the listening first.
      return () => {
        // After the popup's own close in this flush, whichever effect
        // runs first; a popup still shown then finishes on its event. A
        // microtask, not `onFlush`, which is for event handlers: this runs
        // inside the flush.
        queueMicrotask(() => {
          if (stop && !isShown(popup)) finish();
        });
      };
    },
  );
}

function isShown(popup: HTMLElement): boolean {
  return popup.matches("[open], :popover-open");
}
