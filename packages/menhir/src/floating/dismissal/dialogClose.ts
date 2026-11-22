import { createEffect, onFlush } from "solid-js";

import type { OpenChangeDetails } from "./reason.ts";

/**
 * Reports a modal `<dialog>` that the browser closes, while `open`: Escape
 * and other close requests (`cancel`), and a `<form method="dialog">`
 * (`close`). The popup closes through its own state:
 *
 * ```ts
 * createDialogClose({
 *   get dialog() { return dialog; },
 *   get open() { return open(); },
 *   onDismiss: (details) => setOpen(false, details),
 * });
 * ```
 *
 * `cancel` is always prevented, so the state decides. The browser closes
 * the dialog anyway when `cancel` cannot be prevented, such as on a second
 * Escape: that close is reported once, and if the state still says open
 * once it has settled, the dialog is opened again with `showModal()`. A
 * close the popup made itself, after its state turned false, is not
 * reported.
 */
export function createDialogClose(options: {
  readonly dialog: HTMLDialogElement | undefined;
  readonly open: boolean;
  onDismiss(details: OpenChangeDetails): void;
}): void {
  createEffect(
    () => options.open,
    (open) => {
      const dialog = options.dialog;
      if (!open || !dialog) return;
      // The browser fires `cancel` while it handles the key, in the same
      // task, so an Escape of this task is the reason. A timer forgets it.
      let escapeKey: KeyboardEvent | undefined;
      const keydown = (event: KeyboardEvent) => {
        if (event.key !== "Escape") return;
        escapeKey = event;
        setTimeout(() => {
          if (escapeKey === event) escapeKey = undefined;
        });
      };
      // Set when the `close` that follows a `cancel` that could not be
      // prevented has been reported already.
      let reported = false;
      const cancel = (event: Event) => {
        event.preventDefault();
        reported = !event.cancelable;
        options.onDismiss(
          escapeKey
            ? { reason: "escape-key", event: escapeKey }
            : { reason: "close-request", event },
        );
      };
      const close = (event: Event) => {
        if (!reported) options.onDismiss({ reason: "close-request", event });
        reported = false;
        // After the popup's own write (`createControllableSignal` defers it
        // with `onFlush` too), so a refused close is the only one left open.
        onFlush(() => {
          if (options.open && !dialog.open) dialog.showModal();
        });
      };
      document.addEventListener("keydown", keydown, true);
      dialog.addEventListener("cancel", cancel);
      dialog.addEventListener("close", close);
      return () => {
        document.removeEventListener("keydown", keydown, true);
        dialog.removeEventListener("cancel", cancel);
        dialog.removeEventListener("close", close);
      };
    },
  );
}
