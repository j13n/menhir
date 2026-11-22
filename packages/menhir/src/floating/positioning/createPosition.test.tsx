import { createSignal, flush } from "solid-js";
import { describe, expect, it, vi } from "vitest";

import { createRenderer, isJSDOM, screen } from "#test-utils";

import { Popup } from "../../../test/floating/positioning/Popup.tsx";
import type { Position, PositionMiddleware } from "./createPosition.ts";

// The test Popup's anchor is 40 by 20 at (100, 100), its popup 100 by 50.

/** The popup's left and top, as the browser lays it out. */
function placeOf(element: HTMLElement) {
  const { left, top } = element.getBoundingClientRect();
  return { left, top };
}

/** Waits for the frames in which observers report and placements land. */
async function frames(count = 3) {
  for (let i = 0; i < count; i++)
    await new Promise((resolve) => requestAnimationFrame(resolve));
}

/**
 * A middleware that holds each placement until the test releases it, then
 * moves the popup to the `x` it is released with.
 */
function heldMiddleware() {
  const held: ((x: number) => void)[] = [];
  const middleware: PositionMiddleware = {
    name: "held",
    fn: ({ elements }) =>
      new Promise((resolve) =>
        held.push((x) => {
          // What `size` does while it measures: it writes on the popup
          // before its run is over.
          elements.floating.style.setProperty("--held", `${x}`);
          resolve({ x, data: { x } });
        }),
      ),
    write: (popup, data) => popup.style.setProperty("--held", `${data.held.x}`),
  };
  return { middleware, held };
}

/**
 * Once the placements that opening starts are held (in a browser, the
 * observers of autoUpdate report once at the start too), starts one more
 * with a scroll of the window, and returns what releases it.
 */
async function placeAgain(held: ((x: number) => void)[]) {
  await vi.waitFor(() => expect(held.length).toBeGreaterThan(0));
  await frames();
  const count = held.length;
  window.dispatchEvent(new Event("scroll"));
  await vi.waitFor(() => expect(held).toHaveLength(count + 1));
  return held[count];
}

describe("createPosition", () => {
  const { render } = createRenderer();

  it("writes nothing while closed", async () => {
    await render(() => <Popup open={false} />);
    await new Promise((resolve) => setTimeout(resolve));

    const popup = screen.getByTestId("popup");
    expect(popup.style.inset).toBe("");
    expect(popup).not.toHaveAttribute("data-side");
    expect(popup).not.toHaveAttribute("data-align");
    expect(popup.style.getPropertyValue("--anchor-width")).toBe("");
    expect(popup.style.getPropertyValue("--transform-origin")).toBe("");
  });

  it("once open, writes the position, data-side, data-align and the anchor's size", async () => {
    const [open, setOpen] = createSignal(false);
    await render(() => <Popup open={open()} side="top" align="start" />);
    const popup = screen.getByTestId("popup");

    setOpen(true);
    flush();

    await vi.waitFor(() => expect(popup).toHaveAttribute("data-side", "top"));
    expect(popup).toHaveAttribute("data-align", "start");
    expect(popup.style.inset).toMatch(/^-?[\d.]+px auto auto -?[\d.]+px$/);
    expect(popup.style.getPropertyValue("--anchor-width")).toMatch(/^\d+px$/);
    expect(popup.style.getPropertyValue("--anchor-height")).toMatch(/^\d+px$/);
  });

  it("exposes the side, alignment and coordinates as reactive state", async () => {
    let position!: () => Position | undefined;
    await render(() => (
      <Popup open side="right" align="end" position={(p) => (position = p)} />
    ));

    await vi.waitFor(() => expect(position()).toBeDefined());
    const popup = screen.getByTestId("popup");
    expect(position()).toMatchObject({ side: "right", align: "end" });
    expect(`${position()!.x}px`).toBe(popup.style.left);
    expect(`${position()!.y}px`).toBe(popup.style.top);
  });

  it("applies a side changed while open", async () => {
    const [side, setSide] = createSignal<"bottom" | "top">("bottom");
    await render(() => <Popup open side={side()} />);
    const popup = screen.getByTestId("popup");
    await vi.waitFor(() =>
      expect(popup).toHaveAttribute("data-side", "bottom"),
    );

    setSide("top");
    flush();

    await vi.waitFor(() => expect(popup).toHaveAttribute("data-side", "top"));
  });

  it("never writes a stale result over a newer one, even when it comes in last", async () => {
    const { middleware, held } = heldMiddleware();
    await render(() => <Popup open middleware={[middleware]} />);
    const popup = screen.getByTestId("popup");
    const newest = await placeAgain(held);

    newest(22);
    await vi.waitFor(() => expect(popup.style.left).toBe("22px"));
    for (const release of held.slice(0, -1)) release(11);
    await new Promise((resolve) => setTimeout(resolve));

    expect(popup.style.left).toBe("22px");
  });

  it("writes the newest result over what a stale run's middleware wrote", async () => {
    const { middleware, held } = heldMiddleware();
    await render(() => <Popup open middleware={[middleware]} />);
    const popup = screen.getByTestId("popup");
    const newest = await placeAgain(held);

    newest(22);
    // The newest result is written: the middleware's own write came first.
    await vi.waitFor(() => expect(popup.style.left).toBe("22px"));
    for (const release of held.slice(0, -1)) release(11);
    await new Promise((resolve) => setTimeout(resolve));

    expect(popup.style.getPropertyValue("--held")).toBe("22");
  });

  it("drops a result that comes in after the popup has closed", async () => {
    const { middleware, held } = heldMiddleware();
    const [open, setOpen] = createSignal(true);
    await render(() => <Popup open={open()} middleware={[middleware]} />);
    await vi.waitFor(() => expect(held.length).toBeGreaterThan(0));

    setOpen(false);
    flush();
    for (const release of held) release(11);
    await new Promise((resolve) => setTimeout(resolve));

    const popup = screen.getByTestId("popup");
    expect(popup.style.left).toBe("");
    expect(popup).not.toHaveAttribute("data-side");
  });

  describe.skipIf(isJSDOM)("in a browser", () => {
    it.each([
      ["bottom", "center", { left: 70, top: 120 }],
      ["bottom", "start", { left: 100, top: 120 }],
      ["bottom", "end", { left: 40, top: 120 }],
      ["top", "start", { left: 100, top: 50 }],
      ["right", "end", { left: 140, top: 70 }],
      ["left", "center", { left: 0, top: 85 }],
    ] as const)(
      "puts the popup on the %s side, aligned %s",
      async (side, align, expected) => {
        await render(() => <Popup open side={side} align={align} />);
        const popup = screen.getByTestId("popup");

        await vi.waitFor(() => expect(placeOf(popup)).toEqual(expected));
        expect(popup).toHaveAttribute("data-side", side);
        expect(popup).toHaveAttribute("data-align", align);
      },
    );

    it("places the popup before the first paint after it opens", async () => {
      const [open, setOpen] = createSignal(false);
      await render(() => <Popup open={open()} />);
      const popup = screen.getByTestId("popup");

      setOpen(true);
      flush();
      // Animation frame callbacks run before the paint they lead to.
      const painted = await new Promise((resolve) =>
        requestAnimationFrame(() => resolve(placeOf(popup))),
      );

      expect(painted).toEqual({ left: 70, top: 120 });
    });

    it("places a popup rendered open before its first paint", async () => {
      let painted: unknown;
      await render(() => {
        // The first animation frame after the render, before its paint.
        requestAnimationFrame(() => {
          painted = placeOf(screen.getByTestId("popup"));
        });
        return <Popup open />;
      });
      await vi.waitFor(() => expect(painted).toBeDefined());

      expect(painted).toEqual({ left: 70, top: 120 });
    });

    it("aligns start with the anchor's right edge, right to left", async () => {
      await render(() => (
        <div dir="rtl">
          <Popup open align="start" />
        </div>
      ));
      const popup = screen.getByTestId("popup");

      await vi.waitFor(() =>
        expect(popup.getBoundingClientRect().right).toBe(140),
      );
      expect(popup).toHaveAttribute("data-align", "start");
    });

    it("rounds the position to device pixels", async () => {
      await render(() => (
        <Popup
          open
          align="start"
          anchorStyle={{ left: "100.3px", top: "100.6px" }}
        />
      ));
      const popup = screen.getByTestId("popup");
      await vi.waitFor(() => expect(popup.style.left).not.toBe(""));

      const ratio = window.devicePixelRatio;
      for (const value of [popup.style.left, popup.style.top]) {
        const devicePixels = parseFloat(value) * ratio;
        expect(devicePixels).toBe(Math.round(devicePixels));
      }
      expect(parseFloat(popup.style.left)).toBeCloseTo(100.3, 0);
    });

    it.each([
      ["bottom", "center", "50px 0px"],
      ["top", "start", "20px 50px"],
      ["right", "center", "0px 25px"],
      ["left", "start", "100px 10px"],
    ] as const)(
      "sets --transform-origin to the anchor's center on the facing edge, on the %s side aligned %s",
      async (side, align, origin) => {
        await render(() => <Popup open side={side} align={align} />);
        const popup = screen.getByTestId("popup");

        await vi.waitFor(() =>
          expect(popup.style.getPropertyValue("--transform-origin")).toBe(
            origin,
          ),
        );
      },
    );

    it("places the popup at a virtual anchor, a point", async () => {
      const point = {
        getBoundingClientRect: () => DOMRect.fromRect({ x: 200, y: 300 }),
      };
      await render(() => <Popup open align="start" virtualAnchor={point} />);
      const popup = screen.getByTestId("popup");

      await vi.waitFor(() =>
        expect(placeOf(popup)).toEqual({ left: 200, top: 300 }),
      );
      expect(popup.style.getPropertyValue("--anchor-width")).toBe("0px");
    });

    it("follows a scrolling ancestor of the anchor", async () => {
      let scroller!: HTMLDivElement;
      await render(() => (
        <div
          ref={scroller}
          style={{
            position: "fixed",
            inset: "0 auto auto 0",
            width: "300px",
            height: "300px",
            overflow: "auto",
          }}
        >
          <div style={{ height: "1000px", "padding-top": "100px" }}>
            <Popup
              open
              align="start"
              anchorStyle={{ position: "static", display: "block" }}
            />
          </div>
        </div>
      ));
      const popup = screen.getByTestId("popup");
      await vi.waitFor(() =>
        expect(placeOf(popup)).toEqual({ left: 0, top: 120 }),
      );

      scroller.scrollTop = 50;

      await vi.waitFor(() =>
        expect(placeOf(popup)).toEqual({ left: 0, top: 70 }),
      );
    });

    it("follows the anchor when it is resized", async () => {
      await render(() => <Popup open />);
      const popup = screen.getByTestId("popup");
      await vi.waitFor(() => expect(placeOf(popup).left).toBe(70));

      screen.getByRole("button", { name: "Anchor" }).style.width = "80px";

      await vi.waitFor(() => expect(placeOf(popup).left).toBe(90));
      expect(popup.style.getPropertyValue("--anchor-width")).toBe("80px");
    });

    it("follows the popup when it is resized", async () => {
      await render(() => <Popup open />);
      const popup = screen.getByTestId("popup");
      await vi.waitFor(() => expect(placeOf(popup).left).toBe(70));

      popup.style.width = "200px";

      await vi.waitFor(() => expect(placeOf(popup).left).toBe(20));
    });

    it("stops on close: moving the anchor and scrolling afterwards moves nothing", async () => {
      const [open, setOpen] = createSignal(true);
      await render(() => <Popup open={open()} />);
      const popup = screen.getByTestId("popup");
      await vi.waitFor(() => expect(popup.style.left).toBe("70px"));

      setOpen(false);
      flush();
      screen.getByRole("button", { name: "Anchor" }).style.left = "200px";
      window.dispatchEvent(new Event("scroll"));
      window.dispatchEvent(new Event("resize"));
      await frames();

      expect(popup.style.left).toBe("70px");
    });

    it("starts again on reopening, at the anchor's new place", async () => {
      const [open, setOpen] = createSignal(true);
      await render(() => <Popup open={open()} />);
      const popup = screen.getByTestId("popup");
      await vi.waitFor(() => expect(popup.style.left).toBe("70px"));
      setOpen(false);
      flush();
      screen.getByRole("button", { name: "Anchor" }).style.left = "200px";

      setOpen(true);
      flush();

      await vi.waitFor(() => expect(placeOf(popup).left).toBe(170));
    });

    it("stops on disposal: nothing is written after the owner is gone", async () => {
      const { unmount } = await render(() => <Popup open />);
      const popup = screen.getByTestId("popup");
      await vi.waitFor(() => expect(popup.style.left).toBe("70px"));

      unmount();
      window.dispatchEvent(new Event("scroll"));
      window.dispatchEvent(new Event("resize"));
      await frames();

      expect(popup.style.left).toBe("70px");
    });
  });
});
