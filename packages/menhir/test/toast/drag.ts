// A real mouse drag in steps, for the swipe cases: Chromium only, as
// ../floating/input.ts.
import type { Point } from "../floating/input.ts";

async function mouse(
  type: "mouseMoved" | "mousePressed" | "mouseReleased",
  point: Point,
  held = true,
) {
  const { cdp } = await import("vitest/browser");
  await cdp().send("Input.dispatchMouseEvent", {
    type,
    ...point,
    button: held ? "left" : "none",
    buttons: held && type !== "mouseReleased" ? 1 : 0,
    clickCount: type === "mouseMoved" ? 0 : 1,
  });
}

/** Presses the left button at `point`, and holds it. */
export async function hold(point: Point) {
  await mouse("mouseMoved", point, false);
  await mouse("mousePressed", point);
}

/** Moves the held mouse through `points`, one move event each. */
export async function dragTo(...points: Point[]) {
  for (const point of points) await mouse("mouseMoved", point);
}

/** Releases the button at `point`. */
export async function release(point: Point) {
  await mouse("mouseReleased", point);
}

/** `point` moved by `x` and `y` pixels. */
export const moved = (point: Point, x: number, y = 0): Point => ({
  x: point.x + x,
  y: point.y + y,
});
