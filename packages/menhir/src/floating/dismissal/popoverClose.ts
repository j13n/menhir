import { createEffect } from "solid-js";

import type { OpenChangeDetails, OpenChangeReason } from "./reason.ts";

/**
 * Reports an `auto` popover that the browser closes, while `open`, with the
 * reason. The popup closes through its own state:
 *
 * ```ts
 * createPopoverClose({
 *   get popup() { return popup; },
 *   get trigger() { return trigger; },
 *   get open() { return open(); },
 *   onDismiss: (details) => setOpen(false, details),
 * });
 * ```
 *
 * The reason is the input event of the same task: an Escape key
 * (`escape-key`), a pointer released outside the popover (`outside-press`,
 * the browser's light dismiss) or a release or click on the trigger
 * (`trigger-press`, its `popovertarget`); else `close-request`. The
 * browser's close cannot be refused, so if the state still says open once
 * it has settled, the popover is shown again. A close the popup made
 * itself, after its state turned false, is not reported.
 */
export function createPopoverClose(options: {
  readonly popup: HTMLElement | undefined;
  readonly trigger: Element | undefined;
  readonly open: boolean;
  onDismiss(details: OpenChangeDetails): void;
}): void {
  createEffect(
    () => options.open,
    (open) => {
      const popup = options.popup;
      if (!open || !popup) return;
      // The browser fires `beforetoggle` while it handles the key or press
      // that closes the popover, in the same task, so the input event of
      // this task is the reason. A timer forgets it.
      let cause: OpenChangeDetails | undefined;
      const note = (reason: OpenChangeReason, event: Event) => {
        const noted = { reason, event };
        cause = noted;
        setTimeout(() => {
          if (cause === noted) cause = undefined;
        });
      };
      const keydown = (event: KeyboardEvent) => {
        if (event.key === "Escape") note("escape-key", event);
      };
      // Light dismiss closes on `pointerup`. `popovertarget` toggles on
      // `click`, which a key fires too, so a click counts only on the
      // trigger: a key on another popover's trigger is no press outside.
      const pointerup = (event: Event) => {
        const target = event.target as Node;
        if (options.trigger?.contains(target)) note("trigger-press", event);
        else if (!popup.contains(target)) note("outside-press", event);
      };
      const click = (event: Event) => {
        if (options.trigger?.contains(event.target as Node))
          note("trigger-press", event);
      };
      const beforetoggle = (event: Event) => {
        if ((event as ToggleEvent).newState !== "closed" || !options.open)
          return;
        options.onDismiss(cause ?? { reason: "close-request", event });
      };
      // `toggle` comes a task after the popover is hidden, when the popup's
      // own write has landed, so a refused close is the only one still open.
      const toggle = () => {
        if (options.open && !popup.matches(":popover-open"))
          popup.showPopover();
      };
      document.addEventListener("keydown", keydown, true);
      document.addEventListener("pointerup", pointerup, true);
      document.addEventListener("click", click, true);
      popup.addEventListener("beforetoggle", beforetoggle);
      popup.addEventListener("toggle", toggle);
      return () => {
        document.removeEventListener("keydown", keydown, true);
        document.removeEventListener("pointerup", pointerup, true);
        document.removeEventListener("click", click, true);
        popup.removeEventListener("beforetoggle", beforetoggle);
        popup.removeEventListener("toggle", toggle);
      };
    },
  );
}
