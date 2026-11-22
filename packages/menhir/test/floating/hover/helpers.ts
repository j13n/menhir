// Queries and input for the tests of `floating/hover`, against the test
// tooltip in Tooltip.tsx. Testing Library's events, for jsdom and Chromium
// alike; real pointer movement is in ../input.ts.
import { vi } from "vitest";

import { afterFlush, fireEvent, screen } from "#test-utils";

import type { Point } from "../input.ts";

/** Whether the test tooltip of that name is open, by its state. */
export function isOpen(name = "Tooltip") {
  return screen.getByTestId(name).hasAttribute("data-open");
}

/** The trigger of the test tooltip of that name. */
export function trigger(name = "Tooltip") {
  return screen.getByRole("button", { name: `${name} trigger` });
}

/** The pointer entering `element`, and moving on it. */
export function enter(element: Element, pointerType = "mouse") {
  fireEvent.pointerEnter(element, { pointerType, clientX: 10, clientY: 10 });
  fireEvent.pointerMove(element, { pointerType, clientX: 12, clientY: 12 });
}

/**
 * The pointer leaving `element` for the page, then moving on away from
 * everything: out of any safe area, which jsdom, with no layout, puts at
 * the top left corner.
 */
export function leave(element: Element, pointerType = "mouse") {
  fireEvent.pointerLeave(element, {
    pointerType,
    clientX: 500,
    clientY: 500,
    relatedTarget: document.body,
  });
  fireEvent.pointerMove(document.body, {
    pointerType,
    clientX: 500,
    clientY: 600,
  });
}

/** Lets fake timers run that long, then the state they set land. */
export async function wait(ms: number) {
  // A change already made lands first, as it would before any time passed.
  await afterFlush();
  vi.advanceTimersByTime(ms);
  await afterFlush();
}

/** A point in Chromium that the tests' popups and triggers never cover. */
export const away: Point = { x: 380, y: 300 };
