// The `contextmenu` events a test fires: a mouse's secondary button by
// default, or a key's.
import { fireEvent } from "@solidjs/testing-library";

/**
 * A key's `contextmenu`, from Shift+F10 or the Menu key, as the Pointer
 * Events spec sends it: no button and no pointer type.
 */
export const fromKey: PointerEventInit = { button: -1, pointerType: "" };

/**
 * Fires a `contextmenu` at `target`, from a mouse's secondary button unless
 * `init` says otherwise, and returns whether it was cancelled.
 */
export function fireContextMenu(
  target: Element,
  init: PointerEventInit = {},
): boolean {
  const event = new PointerEvent("contextmenu", {
    bubbles: true,
    cancelable: true,
    button: 2,
    pointerType: "mouse",
    ...init,
  });
  fireEvent(target, event);
  return event.defaultPrevented;
}
