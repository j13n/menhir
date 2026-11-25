import { useToastRootContext } from "../root/ToastRootContext.ts";

/** A direction a toast can be swiped away in. */
export type SwipeDirection = "left" | "right" | "up" | "down";

export interface SwipeOptions {
  /** The direction, or directions, it is swiped away in. Default `"right"`. */
  direction?: SwipeDirection | SwipeDirection[];
  /** The distance that dismisses it, in pixels. Default 50. */
  threshold?: number;
}

/**
 * Swipe to dismiss, as a ref for `Toast.Root`:
 *
 * ```tsx
 * <Toast.Root toast={toast} ref={Toast.swipe({ direction: "right" })}>
 * ```
 *
 * While a pointer drags the toast it has `data-swipe="move"` and the
 * distance along the directions it takes in `--toast-swipe-x` and
 * `--toast-swipe-y`. Released past `threshold` it has `data-swipe="end"`
 * and `data-swipe-direction`, keeps the distance for its exit animation and
 * closes with the reason `swipe`; released before, the attributes are
 * removed. A press that became a swipe does not click what it started on.
 * An app that does not import it bundles none of it.
 */
export function swipe(options: SwipeOptions = {}) {
  return (element: HTMLElement) => {
    // A ref runs while the Root renders its element, inside its context.
    const root = useToastRootContext();
    const directions = [options.direction ?? "right"].flat();
    const takes = (direction: SwipeDirection) => directions.includes(direction);
    const threshold = options.threshold ?? 50;
    const horizontal = takes("left") || takes("right");
    // Leaves the browser the scrolling across the swipe, and none of a
    // touch along it, which it would take over as a scroll.
    element.style.touchAction =
      horizontal && (takes("up") || takes("down"))
        ? "none"
        : horizontal
          ? "pan-y"
          : "pan-x";

    let start: { x: number; y: number } | undefined;
    // Whether the press moved far enough not to be a click.
    let swiped = false;
    let x = 0;
    let y = 0;

    const reset = () => {
      start = undefined;
      element.removeAttribute("data-swipe");
      element.removeAttribute("data-swipe-direction");
      element.style.removeProperty("--toast-swipe-x");
      element.style.removeProperty("--toast-swipe-y");
    };

    element.addEventListener("pointerdown", (event) => {
      if (event.button || !root.toast.open) return;
      start = { x: event.clientX, y: event.clientY };
      swiped = false;
      x = y = 0;
    });
    element.addEventListener("pointermove", (event) => {
      if (!start) return;
      const dx = event.clientX - start.x;
      const dy = event.clientY - start.y;
      x = Math.max(
        takes("left") ? -Infinity : 0,
        Math.min(dx, takes("right") ? Infinity : 0),
      );
      y = Math.max(
        takes("up") ? -Infinity : 0,
        Math.min(dy, takes("down") ? Infinity : 0),
      );
      // A press that shakes a little is still a click on what is under it:
      // until here the toast neither moves nor takes the pointer.
      if (!swiped && Math.abs(dx) + Math.abs(dy) <= 5) return;
      swiped = true;
      // Keeps the moves coming once the pointer has left the toast.
      element.setPointerCapture(event.pointerId);
      element.setAttribute("data-swipe", "move");
      element.style.setProperty("--toast-swipe-x", `${x}px`);
      element.style.setProperty("--toast-swipe-y", `${y}px`);
    });
    element.addEventListener("pointerup", (event) => {
      if (!start) return;
      const far = Math.abs(x) > Math.abs(y) ? x : y;
      if (Math.abs(far) < threshold) return reset();
      start = undefined;
      element.setAttribute("data-swipe", "end");
      element.setAttribute(
        "data-swipe-direction",
        far === x ? (x < 0 ? "left" : "right") : y < 0 ? "up" : "down",
      );
      root.close("swipe", event);
    });
    element.addEventListener("pointercancel", reset);
    // In the capture phase, before the click reaches the button's handler.
    element.addEventListener(
      "click",
      (event) => {
        if (!swiped) return;
        swiped = false;
        event.preventDefault();
        event.stopPropagation();
      },
      true,
    );
  };
}
