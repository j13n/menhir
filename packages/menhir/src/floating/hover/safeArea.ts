/** A point in the viewport, as a pointer event gives it. */
export interface ViewportPoint {
  readonly clientX: number;
  readonly clientY: number;
}

/**
 * Follows the pointer once it has left one element on its way to another,
 * such as from a trigger to its popup across the gap between them, and
 * calls `onLeave` with the event once it moves out of the way:
 *
 * ```ts
 * trigger.addEventListener("pointerleave", (event) => {
 *   stop = trackSafeArea(event, popup, () => close());
 * });
 * ```
 *
 * The safe area is every point on a line from `exit`, where the pointer
 * left, to the box of `element`, read again on each move. A move outside
 * it, or past the element, ends it, and so does the pointer leaving the
 * window. A touch is ignored. Returns what stops following; call it when
 * the pointer reaches the element. Plain DOM, with no timers and no Solid.
 */
export function trackSafeArea(
  exit: ViewportPoint,
  element: Element,
  onLeave: (event: PointerEvent) => void,
): () => void {
  const check = (event: PointerEvent) => {
    if (
      // A touch, such as a tap elsewhere while the mouse is in the gap.
      event.pointerType === "touch" ||
      (event.type === "pointerout"
        ? event.relatedTarget
        : inSafeArea(exit, event, element.getBoundingClientRect()))
    )
      return;
    stop();
    onLeave(event);
  };
  const stop = () => {
    document.removeEventListener("pointermove", check);
    document.removeEventListener("pointerout", check);
  };
  document.addEventListener("pointermove", check);
  // Out of the window: a `pointerout` with nothing to go to.
  document.addEventListener("pointerout", check);
  return stop;
}

/**
 * Whether `point` is on a line from `exit` to `box`: whether the ray from
 * `exit` through `point` meets the box at or beyond `point`. Each axis
 * gives the stretch of the ray, in multiples of `exit` to `point`, that is
 * within the box's extent on it; the point is inside if the stretches of
 * both axes overlap beyond 1.
 */
function inSafeArea(
  exit: ViewportPoint,
  point: ViewportPoint,
  box: DOMRect,
): boolean {
  let from = 1;
  let to = Infinity;
  for (const [start, end, min, max] of [
    [exit.clientX, point.clientX, box.left, box.right],
    [exit.clientY, point.clientY, box.top, box.bottom],
  ] as const) {
    const step = end - start;
    if (step) {
      const a = (min - start) / step;
      const b = (max - start) / step;
      from = Math.max(from, Math.min(a, b));
      to = Math.min(to, Math.max(a, b));
    } else if (start < min || start > max) {
      // Still on this axis, and outside the box on it, unless the pointer
      // has not moved at all: the move that left is at `exit` itself.
      return point.clientX === exit.clientX && point.clientY === exit.clientY;
    }
  }
  return from <= to;
}
