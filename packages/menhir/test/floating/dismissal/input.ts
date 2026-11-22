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

/** A touch that starts at `point` and scrolls the page down. */
export async function touchScroll(point: Point) {
  const cdp = await session();
  await cdp.send("Input.synthesizeScrollGesture", {
    ...point,
    yDistance: -200,
    gestureSourceType: "touch",
    speed: 2000,
  });
}

/** Lets the browser's queued events, such as `close` and `toggle`, run. */
export function nextTask() {
  return new Promise((resolve) => setTimeout(resolve, 20));
}
