import { createEffect } from "solid-js";

import type { OpenChangeDetails } from "./reason.ts";

/**
 * Reports a press on a modal `<dialog>`'s backdrop, while `open`, with the
 * reason `outside-press`. The popup closes through its own state:
 *
 * ```ts
 * createOutsidePress({
 *   get dialog() { return dialog; },
 *   get open() { return open(); },
 *   onDismiss: (details) => setOpen(false, details),
 * });
 * ```
 *
 * A press on the backdrop targets the `<dialog>` itself, as one on its
 * padding or its own scrollbar does, so the backdrop is where the target is
 * the dialog and the point is outside its border box. It closes on release,
 * as the browser's light dismiss does: on the `click` of a primary-button
 * press that also started on the backdrop. So a press dragged out of the
 * dialog, a secondary button (no `click`) and a touch that scrolls
 * (`pointercancel`, no `click`) do not close it.
 */
export function createOutsidePress(options: {
  readonly dialog: HTMLDialogElement | undefined;
  readonly open: boolean;
  onDismiss(details: OpenChangeDetails): void;
}): void {
  createEffect(
    () => options.open,
    (open) => {
      const dialog = options.dialog;
      if (!open || !dialog) return;
      const onBackdrop = (event: MouseEvent) => {
        if (event.target !== dialog) return false;
        const { left, top, right, bottom } = dialog.getBoundingClientRect();
        const { clientX: x, clientY: y } = event;
        return x < left || x > right || y < top || y > bottom;
      };
      let pressed = false;
      const pointerdown = (event: PointerEvent) => {
        pressed = event.button === 0 && onBackdrop(event);
      };
      const click = (event: MouseEvent) => {
        if (pressed && onBackdrop(event))
          options.onDismiss({ reason: "outside-press", event });
        pressed = false;
      };
      dialog.addEventListener("pointerdown", pointerdown);
      dialog.addEventListener("click", click);
      return () => {
        dialog.removeEventListener("pointerdown", pointerdown);
        dialog.removeEventListener("click", click);
      };
    },
  );
}
