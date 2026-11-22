import type { JSX } from "@solidjs/web";
import { describe, expect, it, vi } from "vitest";

import { createRenderer, isJSDOM, screen } from "#test-utils";

import { Popup } from "../../../test/floating/positioning/Popup.tsx";
import { arrow } from "./arrow.ts";
import { flip } from "./flip.ts";
import { hide } from "./hide.ts";
import { offset } from "./offset.ts";
import { shift } from "./shift.ts";
import { size } from "./size.ts";

// The test Popup's anchor is 40 by 20 at (100, 100) unless moved, its popup
// 100 by 50. Every case needs layout, so they run in Chromium only.

function placeOf(element: Element) {
  const { left, top } = element.getBoundingClientRect();
  return { left, top };
}

async function frames(count = 3) {
  for (let i = 0; i < count; i++)
    await new Promise((resolve) => requestAnimationFrame(resolve));
}

/** The anchor at (`left`, `top`), with a viewport size given as `w`, `h`. */
type At = (w: number, h: number) => { left: number; top: number };

const at = (place: { left: number; top: number }): JSX.CSSProperties => ({
  left: `${place.left}px`,
  top: `${place.top}px`,
});

describe.skipIf(isJSDOM)("positioning middleware", () => {
  const { render } = createRenderer();

  it("offset puts the gap between anchor and popup, and shifts along the alignment", async () => {
    await render(() => (
      <Popup
        open
        align="start"
        middleware={[offset({ mainAxis: 8, alignmentAxis: 4 })]}
      />
    ));
    const popup = screen.getByTestId("popup");

    await vi.waitFor(() =>
      expect(placeOf(popup)).toEqual({ left: 104, top: 128 }),
    );
  });

  it.each<[string, "top" | "right" | "bottom" | "left", At, string, At]>([
    // [edge, side asked for, anchor, side it flips to, popup]
    [
      "bottom",
      "bottom",
      (_, h) => ({ left: 100, top: h - 30 }),
      "top",
      (_, h) => ({ left: 70, top: h - 80 }),
    ],
    [
      "top",
      "top",
      () => ({ left: 100, top: 10 }),
      "bottom",
      () => ({ left: 70, top: 30 }),
    ],
    [
      "left",
      "left",
      () => ({ left: 10, top: 100 }),
      "right",
      () => ({ left: 50, top: 85 }),
    ],
    [
      "right",
      "right",
      (w) => ({ left: w - 50, top: 100 }),
      "left",
      (w) => ({ left: w - 150, top: 85 }),
    ],
  ])(
    "flip at the %s edge moves the popup from the %s side to the opposite one",
    async (_edge, side, anchor, flipped, expected) => {
      const { innerWidth: w, innerHeight: h } = window;
      await render(() => (
        <Popup
          open
          side={side}
          anchorStyle={at(anchor(w, h))}
          middleware={[flip()]}
        />
      ));
      const popup = screen.getByTestId("popup");

      await vi.waitFor(() =>
        expect(popup).toHaveAttribute("data-side", flipped),
      );
      expect(placeOf(popup)).toEqual(expected(w, h));
    },
  );

  it.each<[string, "bottom" | "right", At, At]>([
    // [edge, side, anchor, popup], 8 pixels of padding.
    [
      "left",
      "bottom",
      () => ({ left: 0, top: 100 }),
      () => ({ left: 8, top: 120 }),
    ],
    [
      "right",
      "bottom",
      (w) => ({ left: w - 40, top: 100 }),
      (w) => ({ left: w - 108, top: 120 }),
    ],
    [
      "top",
      "right",
      () => ({ left: 100, top: 0 }),
      () => ({ left: 140, top: 8 }),
    ],
    [
      "bottom",
      "right",
      (_, h) => ({ left: 100, top: h - 20 }),
      (_, h) => ({ left: 140, top: h - 58 }),
    ],
  ])(
    "shift at the %s edge keeps the popup in view, padding away from the edge",
    async (_edge, side, anchor, expected) => {
      const { innerWidth: w, innerHeight: h } = window;
      await render(() => (
        <Popup
          open
          side={side}
          anchorStyle={at(anchor(w, h))}
          middleware={[shift({ padding: 8 })]}
        />
      ));
      const popup = screen.getByTestId("popup");

      await vi.waitFor(() => expect(placeOf(popup)).toEqual(expected(w, h)));
      expect(popup).toHaveAttribute("data-side", side);
    },
  );

  it("size writes --available-width and --available-height", async () => {
    await render(() => <Popup open middleware={[size({ padding: 8 })]} />);
    const popup = screen.getByTestId("popup");

    // Below the anchor, whose bottom edge is at 120, to 8 pixels from the
    // viewport's bottom.
    await vi.waitFor(() =>
      expect(popup.style.getPropertyValue("--available-height")).toBe(
        `${window.innerHeight - 128}px`,
      ),
    );
    expect(
      parseFloat(popup.style.getPropertyValue("--available-width")),
    ).toBeGreaterThan(0);
  });

  it("size lets a popup limited by it fit, and keep its side", async () => {
    await render(() => (
      <Popup
        open
        middleware={[flip({ padding: 8 }), size({ padding: 8 })]}
        popupStyle={{
          height: "4000px",
          "max-height": "var(--available-height)",
        }}
      />
    ));
    const popup = screen.getByTestId("popup");

    await vi.waitFor(() =>
      expect(popup.getBoundingClientRect().bottom).toBe(window.innerHeight - 8),
    );
    await frames();
    expect(popup).toHaveAttribute("data-side", "bottom");
    expect(popup.getBoundingClientRect().top).toBe(120);
  });

  it("arrow points at the anchor's center, also when shift has moved the popup", async () => {
    await render(() => {
      const element = (
        <div
          data-testid="arrow"
          style={{ position: "absolute", width: "10px", height: "10px" }}
        />
      ) as HTMLElement;
      return (
        <Popup
          open
          anchorStyle={{ left: "0px" }}
          middleware={[shift({ padding: 8 }), arrow({ element })]}
        >
          {element}
        </Popup>
      );
    });
    const popup = screen.getByTestId("popup");
    const element = screen.getByTestId("arrow");

    await vi.waitFor(() => expect(placeOf(popup).left).toBe(8));
    const { left, width } = element.getBoundingClientRect();
    // The anchor's center is at 20.
    expect(left + width / 2).toBe(20);
    expect(element.style.top).toBe("");
  });

  it("hide sets data-anchor-hidden while the anchor is scrolled out of its scrolling ancestor", async () => {
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
            middleware={[hide()]}
            anchorStyle={{ position: "static", display: "block" }}
          />
        </div>
      </div>
    ));
    const popup = screen.getByTestId("popup");
    await vi.waitFor(() => expect(popup).toHaveAttribute("data-side"));
    expect(popup).not.toHaveAttribute("data-anchor-hidden");

    scroller.scrollTop = 150;
    await vi.waitFor(() =>
      expect(popup).toHaveAttribute("data-anchor-hidden", ""),
    );

    scroller.scrollTop = 0;
    await vi.waitFor(() =>
      expect(popup).not.toHaveAttribute("data-anchor-hidden"),
    );
  });
});
