import { createEffect } from "solid-js";

import { isSameStop, tabStops } from "./tabbable.ts";

/**
 * Tab and Shift+Tab cycle inside a modal `<dialog>` while `open`, as the
 * WAI-ARIA modal dialog pattern asks. The browser lets them leave for its
 * own UI.
 *
 * ```ts
 * createTabWrap({
 *   get dialog() { return dialog; },
 *   get open() { return open(); },
 * });
 * ```
 *
 * Tab from the last tab stop, or from an element after it, moves to the
 * first; Shift+Tab from the first, from an element before it or from the
 * dialog itself, to the last. Elsewhere the browser moves focus. Only the
 * topmost dialog wraps, and a key already handled does not.
 */
export function createTabWrap(options: {
  readonly dialog: HTMLDialogElement | undefined;
  readonly open: boolean;
}): void {
  createEffect(
    () => options.open,
    (open) => {
      const dialog = options.dialog;
      if (!open || !dialog) return;
      const keydown = (event: KeyboardEvent) => {
        if (
          event.key !== "Tab" ||
          event.defaultPrevented ||
          // A nested dialog's key, bubbling through this one.
          dialogOf(event) !== dialog
        )
          return;
        const stops = tabStops(dialog);
        const forward = !event.shiftKey;
        const edge = forward ? stops.at(-1) : stops[0];
        let active = document.activeElement;
        while (active?.shadowRoot?.activeElement)
          active = active.shadowRoot.activeElement;
        if (
          !edge ||
          isSameStop(active, edge) ||
          // Focus on an element that is no stop, past the edge.
          (!stops.some((stop) => isSameStop(active, stop)) &&
            edge.compareDocumentPosition(active!) &
              (forward
                ? Node.DOCUMENT_POSITION_FOLLOWING
                : Node.DOCUMENT_POSITION_PRECEDING))
        ) {
          event.preventDefault();
          (forward ? stops[0] : stops.at(-1))?.focus();
        }
      };
      // On the window, after the document, where Solid delegates its
      // handlers, so a consumer's `onKeyDown` can handle the key first.
      window.addEventListener("keydown", keydown);
      return () => window.removeEventListener("keydown", keydown);
    },
  );
}

/**
 * The nearest `<dialog>` around the key's target, across shadow roots: at
 * the window, `target` is retargeted to the outermost shadow host.
 */
function dialogOf(event: Event): Element | null {
  let node = event.composedPath()[0] as Element;
  let dialog: Element | null;
  while (!(dialog = node.closest("dialog"))) {
    const root = node.getRootNode();
    if (!(root instanceof ShadowRoot)) break;
    node = root.host;
  }
  return dialog;
}
