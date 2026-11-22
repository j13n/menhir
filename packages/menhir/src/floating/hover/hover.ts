import { createEffect, createSignal, onCleanup, onSettled } from "solid-js";

import type { OpenChangeDetails } from "../dismissal/reason.ts";
import type { HoverGroup, HoverGroupMember } from "./group.ts";
import { trackSafeArea, type ViewportPoint } from "./safeArea.ts";

/**
 * Opens a popup when the pointer rests on its trigger for `delay`
 * milliseconds (default 600), and closes it `closeDelay` milliseconds
 * (default 0) after the pointer has left both the trigger and the popup:
 *
 * ```ts
 * createHover({
 *   get trigger() { return trigger; },
 *   get popup() { return popup; },
 *   get open() { return open(); },
 *   get delay() { return props.delay; },
 *   onOpenChange: (open, details) => setOpen(open, details),
 * });
 * ```
 *
 * Both report `trigger-hover`. The pointer may cross from the trigger to the
 * popup, and back, through the safe area between them (`trackSafeArea`).
 * A mouse or a pen opens it; a touch does not. While `disabled`, hovering
 * opens nothing. In a `group` (`createHoverGroup`), it opens at once while
 * another member is open, and closes that one. A change of `open`, from
 * here or elsewhere, and disposal clear a pending delay; disposal also
 * takes the popup out of its group. Nothing runs on the server.
 */
export function createHover(options: {
  readonly trigger: HTMLElement | undefined;
  readonly popup: HTMLElement | undefined;
  readonly open: boolean;
  readonly delay?: number;
  readonly closeDelay?: number;
  readonly disabled?: boolean;
  readonly group?: HoverGroup;
  onOpenChange(open: boolean, details: OpenChangeDetails): void;
}): void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let stopSafeArea: (() => void) | undefined;
  // Where the pointer last was over the trigger or the popup.
  let last: ViewportPoint | undefined;
  const cancel = () => {
    clearTimeout(timer);
    timer = undefined;
    stopSafeArea?.();
    stopSafeArea = undefined;
  };
  /** Opens or closes after `delay`, or now if it is 0. */
  const schedule = (open: boolean, event: Event, delay: number) => {
    cancel();
    const set = () => {
      timer = undefined;
      // Disabled, or removed, while the delay was pending.
      if (open && (options.disabled || !options.trigger?.isConnected)) return;
      if (open) options.group?.opened(member, event);
      options.onOpenChange(open, { reason: "trigger-hover", event });
    };
    if (delay > 0) timer = setTimeout(set, delay);
    else set();
  };
  const close = (event: Event) =>
    schedule(false, event, options.closeDelay ?? 0);
  const member: HoverGroupMember = {
    close: (event) => schedule(false, event, 0),
  };
  onCleanup(() => {
    cancel();
    // Closed with its owner: an open popup that the group still counted
    // would keep the group open, and be closed by the next member.
    options.group?.closed(member);
  });

  // A touch fires pointer events too, which are ignored, as `trackSafeArea`
  // ignores them; the mouse events a browser emulates after it are not
  // pointer events, so they never reach here.
  const listen = (
    element: HTMLElement,
    other: () => Element | undefined,
    onEnter: (event: PointerEvent) => void,
  ) => {
    const enter = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      move(event);
      cancel();
      onEnter(event);
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType !== "touch") last = event;
    };
    const leave = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      cancel();
      if (!options.open) return;
      const to = other();
      // A leave at the pointer's last position is the page moving under a
      // still pointer, such as a scroll, and one with nothing to go to is
      // the pointer leaving the window: no move follows to end a safe area.
      if (
        to &&
        event.relatedTarget &&
        (event.clientX !== last?.clientX || event.clientY !== last.clientY)
      )
        stopSafeArea = trackSafeArea(event, to, close);
      else close(event);
    };
    element.addEventListener("pointerenter", enter);
    element.addEventListener("pointermove", move);
    element.addEventListener("pointerleave", leave);
    return () => {
      element.removeEventListener("pointerenter", enter);
      element.removeEventListener("pointermove", move);
      element.removeEventListener("pointerleave", leave);
    };
  };

  // The trigger usually comes from a ref, assigned while the component
  // renders, after an effect's first compute: it is read once mounted.
  const [mounted, setMounted] = createSignal(false);
  onSettled(() => {
    setMounted(true);
  });
  createEffect(
    () => mounted() && options.trigger,
    (trigger) => {
      if (!trigger) return;
      return listen(
        trigger,
        () => options.popup,
        (event) => {
          if (options.open || options.disabled) return;
          const group = options.group;
          schedule(
            true,
            event,
            (group ? group.delay(options.delay) : options.delay) ?? 600,
          );
        },
      );
    },
  );
  createEffect(
    () => options.open,
    (open) => {
      cancel();
      if (!open) options.group?.closed(member);
      const popup = options.popup;
      if (!open || !popup) return;
      return listen(
        popup,
        () => options.trigger,
        () => {},
      );
    },
  );
}
