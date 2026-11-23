// Real input for the cases the browser acts on: an untrusted event from
// Testing Library opens no close request and dismisses no popover. Only in
// Chromium, through `vitest/browser`, which throws when imported in jsdom,
// so it is imported when a helper is first called.

async function session() {
  const { cdp } = await import("vitest/browser");
  return cdp();
}

/** Presses a key, as `{Escape}` or `{Enter}`. */
export async function keyboard(keys: string) {
  const { userEvent } = await import("vitest/browser");
  await userEvent.keyboard(keys);
}

export interface Point {
  x: number;
  y: number;
}

/** The middle of an element, in the viewport. */
export function centerOf(element: Element): Point {
  const { left, top, width, height } = element.getBoundingClientRect();
  return { x: left + width / 2, y: top + height / 2 };
}

/**
 * A mouse press that starts at `from` and ends at `to`, by default where it
 * started, with the left button or another.
 */
export async function press(
  from: Point,
  to: Point = from,
  button: "left" | "right" | "middle" = "left",
) {
  const cdp = await session();
  const common = { button, clickCount: 1 };
  await cdp.send("Input.dispatchMouseEvent", {
    type: "mouseMoved",
    ...from,
  });
  await cdp.send("Input.dispatchMouseEvent", {
    type: "mousePressed",
    ...from,
    ...common,
  });
  if (to !== from) {
    await cdp.send("Input.dispatchMouseEvent", {
      type: "mouseMoved",
      ...to,
      button,
    });
  }
  await cdp.send("Input.dispatchMouseEvent", {
    type: "mouseReleased",
    ...to,
    ...common,
  });
}

/**
 * Moves the mouse, or a pen that hovers, through `points` in turn, as a
 * pointer moves: one move event each.
 */
export async function movePointer(
  points: Point[],
  pointerType: "mouse" | "pen" = "mouse",
) {
  const cdp = await session();
  for (const point of points) {
    await cdp.send("Input.dispatchMouseEvent", {
      type: "mouseMoved",
      ...point,
      pointerType,
    });
  }
}

/** The points of a straight line from `from` to `to`, in `steps` steps. */
export function line(from: Point, to: Point, steps = 10): Point[] {
  return Array.from({ length: steps }, (_, index) => {
    const t = (index + 1) / steps;
    return {
      x: from.x + (to.x - from.x) * t,
      y: from.y + (to.y - from.y) * t,
    };
  });
}

/** A short touch at one point. */
export async function tap(point: Point) {
  const cdp = await session();
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [point],
  });
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
}

/**
 * Resolves once a scroll of the page, or of an element in it, has ended, or
 * after `timeout` milliseconds if nothing scrolls. Called once the input
 * has been sent, so a scroll from before it does not count.
 */
function scrollEnded(timeout: number) {
  return new Promise((resolve) => {
    // A scroll container's `scrollend` does not bubble; in capture it
    // passes the document.
    document.addEventListener("scrollend", resolve, {
      once: true,
      capture: true,
    });
    setTimeout(resolve, timeout);
  });
}

/**
 * A touch held at `point` for a second, which Chromium turns into a long
 * press: a `contextmenu` with the touch's pointer type, then the release.
 */
export async function longPress(point: Point) {
  const cdp = await session();
  await cdp.send("Input.synthesizeTapGesture", {
    ...point,
    duration: 1000,
    tapCount: 1,
    gestureSourceType: "touch",
  });
}

/**
 * The Menu key (the context menu key) on the focused element, which fires
 * a `contextmenu` at it. Chromium on macOS fires none for Shift+F10.
 */
export async function menuKey() {
  const cdp = await session();
  const key = { key: "ContextMenu", code: "ContextMenu" };
  await cdp.send("Input.dispatchKeyEvent", {
    type: "rawKeyDown",
    ...key,
    windowsVirtualKeyCode: 93,
  });
  await cdp.send("Input.dispatchKeyEvent", {
    type: "keyUp",
    ...key,
    windowsVirtualKeyCode: 93,
  });
}

/**
 * A touch that starts at `point` and drags up, which scrolls the page down,
 * and resolves once the scroll has ended, or after `timeout` milliseconds
 * if the page does not scroll: a tap while the page still moves only stops
 * it, with no `click`. Explicit touch events: Chromium on Linux turns
 * `Input.synthesizeScrollGesture` into a tap, with no scroll.
 */
export async function touchScroll(point: Point, timeout = 2000) {
  const cdp = await session();
  const ended = scrollEnded(timeout);
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [point],
  });
  for (let step = 1; step <= 5; step++) {
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x: point.x, y: point.y - step * 50 }],
    });
  }
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await ended;
}

/**
 * A turn of the mouse wheel over `point`, down by `deltaY` pixels, that
 * resolves once the scroll it starts has ended, or after `timeout`
 * milliseconds if nothing scrolls.
 */
export async function wheel(point: Point, deltaY = 300, timeout = 500) {
  const cdp = await session();
  await cdp.send("Input.dispatchMouseEvent", {
    type: "mouseWheel",
    ...point,
    deltaX: 0,
    deltaY,
  });
  await scrollEnded(timeout);
}

/** Lets the browser's queued events, such as `close` and `toggle`, run. */
export function nextTask() {
  return new Promise((resolve) => setTimeout(resolve, 20));
}
