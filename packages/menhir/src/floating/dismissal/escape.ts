import { createEffect } from "solid-js";

import type { OpenChangeDetails } from "./reason.ts";

/** A key event, with the claim of the popup that is to close on it. */
type ClaimedEvent = KeyboardEvent & { menhirEscapeClaim?: unknown };

/**
 * Escape for a popup the browser does not close on Escape, a `manual`
 * popover such as Tooltip's, or for content in the page's flow, such as
 * Navigation Menu's Panels. While `open`, an Escape key calls `onDismiss`
 * with the reason `escape-key`:
 *
 * ```ts
 * createEscape({
 *   get open() { return open(); },
 *   onDismiss: (details) => setOpen(false, details),
 * });
 * ```
 *
 * Only the popup opened last closes, one per key. The key is marked
 * handled (`preventDefault()`), so the browser does not also close a dialog
 * or popover below, and carries on to the page's own listeners. A key
 * already handled, or one pressed while an input method is composing, does
 * nothing.
 */
export function createEscape(options: {
  readonly open: boolean;
  onDismiss(details: OpenChangeDetails): void;
}): void {
  createEffect(
    () => options.open,
    (open) => {
      if (!open) return;
      // Listeners of one target and phase run in the order they were
      // added, and each popup adds its own when it opens. In the capture
      // phase, the one opened last claims the key last; in the bubble
      // phase, after the page's listeners, only the claim holder closes.
      const claim = (event: ClaimedEvent) => {
        event.menhirEscapeClaim = claim;
      };
      const close = (event: ClaimedEvent) => {
        if (
          event.key !== "Escape" ||
          event.isComposing ||
          event.defaultPrevented ||
          event.menhirEscapeClaim !== claim
        )
          return;
        event.preventDefault();
        options.onDismiss({ reason: "escape-key", event });
      };
      document.addEventListener("keydown", claim, true);
      document.addEventListener("keydown", close);
      return () => {
        document.removeEventListener("keydown", claim, true);
        document.removeEventListener("keydown", close);
      };
    },
  );
}
