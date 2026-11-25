// What the Scroll Area tests share: an area laid out as a consumer's CSS
// would, the jsdom stand-in for `ResizeObserver`, and real input in
// Chromium (src/scroll-area/README.md, "Test list").
import type { JSX } from "@solidjs/web";
import { afterAll, beforeAll, vi } from "vitest";

import { afterFlush, isJSDOM, screen } from "#test-utils";

import { ScrollArea } from "../../src/scroll-area/index.ts";

export interface AreaProps {
  /** The content's size in pixels; the viewport is 100 × 100. */
  width?: number;
  height?: number;
  /** Which Scrollbars to render: `"both"` by default. */
  scrollbars?: "both" | "vertical" | "horizontal" | "none";
  dir?: "ltr" | "rtl";
  children?: JSX.Element;
}

/**
 * A 100 × 100 area, in the page's top left corner so that pointer
 * coordinates are easy to read: each Scrollbar is 10 px wide along an
 * edge, its track the whole edge, and its Thumb sized and placed with the
 * variables as the docs show.
 */
export function Area(props: AreaProps) {
  const vertical = () =>
    props.scrollbars === undefined ||
    props.scrollbars === "both" ||
    props.scrollbars === "vertical";
  const horizontal = () =>
    props.scrollbars === undefined ||
    props.scrollbars === "both" ||
    props.scrollbars === "horizontal";
  return (
    <div dir={props.dir} style={{ position: "absolute", left: 0, top: 0 }}>
      <ScrollArea.Root
        data-testid="root"
        style={{ position: "relative", width: "100px", height: "100px" }}
      >
        <ScrollArea.Viewport
          data-testid="viewport"
          aria-label="Notes"
          style={{ overflow: "auto", width: "100px", height: "100px" }}
        >
          <ScrollArea.Content data-testid="content">
            {props.children ?? (
              <div
                data-testid="block"
                style={{
                  width: `${props.width ?? 50}px`,
                  height: `${props.height ?? 400}px`,
                }}
              />
            )}
          </ScrollArea.Content>
        </ScrollArea.Viewport>
        {vertical() && (
          <ScrollArea.Scrollbar
            data-testid="scrollbar-y"
            orientation="vertical"
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              "inset-inline-end": 0,
              width: "10px",
            }}
          >
            <ScrollArea.Thumb
              data-testid="thumb-y"
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                height: "var(--thumb-size)",
                top: "calc((100% - var(--thumb-size)) * var(--thumb-position))",
              }}
            />
          </ScrollArea.Scrollbar>
        )}
        {horizontal() && (
          <ScrollArea.Scrollbar
            data-testid="scrollbar-x"
            orientation="horizontal"
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: "10px",
            }}
          >
            <ScrollArea.Thumb
              data-testid="thumb-x"
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                width: "var(--thumb-size)",
                "inset-inline-start":
                  "calc((100% - var(--thumb-size)) * var(--thumb-position))",
              }}
            />
          </ScrollArea.Scrollbar>
        )}
      </ScrollArea.Root>
    </div>
  );
}

export const root = () => screen.getByTestId("root");
export const viewport = () => screen.getByTestId("viewport");
export const content = () => screen.getByTestId("content");
export const scrollbar = (axis: "x" | "y") =>
  screen.queryByTestId(`scrollbar-${axis}`);
export const thumb = (axis: "x" | "y") => screen.getByTestId(`thumb-${axis}`);

/**
 * jsdom has no `ResizeObserver`, and no layout for one to observe: stands
 * in one that observes nothing, for the tests of the file or `describe`
 * block it is called in. Does nothing in a browser.
 */
export function stubResizeObserver(): void {
  if (!isJSDOM) return;
  beforeAll(() => {
    vi.stubGlobal(
      "ResizeObserver",
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
  });
  afterAll(() => vi.unstubAllGlobals());
}

const nextFrame = () =>
  new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

/**
 * Waits for the area to settle after a change of layout or scroll: the
 * `ResizeObserver` reports before the next paint, the `scroll` event is
 * fired in the next frame, and the parts update a microtask later.
 */
export async function settled() {
  await nextFrame();
  await nextFrame();
  await afterFlush();
}

export interface Point {
  x: number;
  y: number;
}

/**
 * Real mouse input in Chromium, through the DevTools protocol. A move
 * holds the button down while it is pressed, as a drag does.
 */
export async function mouse(
  type: "mousePressed" | "mouseMoved" | "mouseReleased",
  point: Point,
  options: { buttons?: number; modifiers?: number } = {},
) {
  const { cdp } = await import("vitest/browser");
  await cdp().send("Input.dispatchMouseEvent", {
    type,
    ...point,
    button: type === "mouseMoved" && options.buttons === 0 ? "none" : "left",
    buttons: options.buttons ?? (type === "mouseReleased" ? 0 : 1),
    clickCount: 1,
    modifiers: options.modifiers ?? 0,
  });
  await settled();
}

/** Real touch input in Chromium; no point ends the touch. */
export async function touch(
  type: "touchStart" | "touchMove" | "touchEnd",
  point?: Point,
) {
  const { cdp } = await import("vitest/browser");
  await cdp().send("Input.dispatchTouchEvent", {
    type,
    touchPoints: point ? [point] : [],
  });
  await settled();
}

/** A wheel turned over a point, by pixels. */
export async function wheel(point: Point, deltaY: number) {
  const { cdp } = await import("vitest/browser");
  await cdp().send("Input.dispatchMouseEvent", {
    type: "mouseWheel",
    ...point,
    deltaX: 0,
    deltaY,
  });
  await settled();
}

/** Whether the parts mounted so far are none of them in a Scrollbar. */
export const noScrollbars = () =>
  scrollbar("x") === null && scrollbar("y") === null;

/**
 * In jsdom, lays every element out as a 100 × 100 box around 400 × 400 of
 * content, with a `ResizeObserver` that reports at once and a browser that
 * can hide its scrollbars, so that both Scrollbars render, for the part
 * conventions. Call it in place of `stubResizeObserver`, in a `describe`
 * block that runs only in jsdom.
 */
export function stubOverflowingLayout(): void {
  const element = HTMLElement.prototype;
  const sizes = {
    clientWidth: 100,
    clientHeight: 100,
    scrollWidth: 400,
    scrollHeight: 400,
  };
  beforeAll(() => {
    for (const [name, value] of Object.entries(sizes)) {
      Object.defineProperty(element, name, {
        configurable: true,
        get: () => value,
      });
    }
    vi.spyOn(CSS, "supports").mockReturnValue(true);
    vi.stubGlobal(
      "ResizeObserver",
      class {
        constructor(private callback: () => void) {}
        observe() {
          this.callback();
        }
        unobserve() {}
        disconnect() {}
      },
    );
  });
  afterAll(() => {
    for (const name of Object.keys(sizes)) {
      delete (element as unknown as Record<string, unknown>)[name];
    }
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });
}
