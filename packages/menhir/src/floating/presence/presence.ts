import { createEffect } from "solid-js";

/**
 * Shows a popup when `open` turns true, and hides it once its exit
 * animations have ended after `open` turns false:
 *
 * ```ts
 * createPresence({
 *   get popup() { return dialog; },
 *   get open() { return open(); },
 * });
 * ```
 *
 * A `<dialog>` is shown with `showModal()` and hidden with `close()`; any
 * other element is a popover, shown with `showPopover()` and hidden with
 * `hidePopover()`. On closing it waits for the animations and transitions
 * running in the popup, its descendants and its `::backdrop`, the ones its
 * `data-closed` starts, and hides it at once if none is running; infinite
 * and paused ones do not count. Meanwhile the popup is `inert`, unless it is
 * a popover that holds focus, which only returns focus to its trigger from
 * inside. Opening again cancels the exit. A non-modal `<dialog open>` from
 * the server is made modal without a `close` event. Nothing runs on the
 * server.
 */
export function createPresence(options: {
  readonly popup: HTMLElement | undefined;
  readonly open: boolean;
}): void {
  // Ends the exit under way, if any, and puts the popup's `inert` back. A
  // wait whose exit has ended does nothing.
  let stopLeaving: (() => void) | undefined;
  createEffect(
    () => options.open,
    (open) => {
      const popup = options.popup;
      if (!popup) return;
      const dialog = popup instanceof HTMLDialogElement ? popup : undefined;
      stopLeaving?.();
      if (open) {
        if (dialog) {
          if (!dialog.matches(":modal")) {
            // A non-modal `<dialog open>` from the server. `close()` would
            // fire `close`, a task later; removing `open` fires nothing.
            dialog.removeAttribute("open");
            dialog.showModal();
          }
        } else if (!popup.matches(":popover-open")) popup.showPopover();
        return;
      }
      if (!popup.matches("[open], :popover-open")) return;
      const inert = popup.inert;
      if (dialog || !popup.contains(document.activeElement)) popup.inert = true;
      const stop = (stopLeaving = () => {
        stopLeaving = undefined;
        popup.inert = inert;
      });
      // Asks again once they have settled, for one that started meanwhile.
      // A cancelled animation settles too, as do those of a popup the
      // browser hid or that left the document.
      const wait = () => {
        if (stopLeaving !== stop) return;
        const running = popup
          .getAnimations({ subtree: true })
          .filter(
            (animation) =>
              animation.playState === "running" &&
              animation.effect?.getComputedTiming().endTime !== Infinity,
          );
        if (running.length) {
          void Promise.allSettled(
            running.map((animation) => animation.finished),
          ).then(wait);
          return;
        }
        stop();
        if (dialog) dialog.close();
        else if (popup.matches(":popover-open")) popup.hidePopover();
      };
      wait();
    },
  );
}
