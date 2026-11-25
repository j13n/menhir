// The test list and the cases left out are in ../README.md. The layout,
// scrolling and pointer cases send real input to Chromium, since jsdom lays
// nothing out.
import { Errored, createSignal, flush } from "solid-js";
import { afterEach, describe, expect, it } from "vitest";

import {
  createRenderer,
  describeConformance,
  isJSDOM,
  screen,
} from "#test-utils";

import {
  Area,
  mouse,
  scrollbar,
  settled,
  wheel,
  stubOverflowingLayout,
  stubResizeObserver,
  viewport,
} from "../../../test/scroll-area/harness.tsx";
import { ScrollArea } from "../index.ts";

if (isJSDOM) {
  // A Scrollbar renders once the area has measured an overflow, which only
  // the stand-in layout gives at once.
  describe("conformance", () => {
    stubOverflowingLayout();
    describeConformance(
      "<ScrollArea.Scrollbar />",
      (props) => (
        <ScrollArea.Root>
          <ScrollArea.Viewport>
            <ScrollArea.Content />
          </ScrollArea.Viewport>
          <ScrollArea.Scrollbar {...props} />
        </ScrollArea.Root>
      ),
      { tagName: "DIV" },
    );
  });
}

describe("<ScrollArea.Scrollbar />", () => {
  stubResizeObserver();
  const { render } = createRenderer();

  const variable = (axis: "x" | "y", name: string) =>
    scrollbar(axis)!.style.getPropertyValue(name);

  it("renders nothing before the area has measured it", async () => {
    await render(() => <Area />);

    expect(scrollbar("x")).toBeNull();
    expect(scrollbar("y")).toBeNull();
  });

  it.skipIf(isJSDOM)("is rendered only while its axis overflows", async () => {
    const [height, setHeight] = createSignal(400);
    const [width, setWidth] = createSignal(50);
    await render(() => <Area height={height()} width={width()} />);
    await settled();
    expect(scrollbar("y")).not.toBeNull();
    expect(scrollbar("x")).toBeNull();

    setHeight(50);
    setWidth(400);
    flush();
    await settled();
    expect(scrollbar("y")).toBeNull();
    expect(scrollbar("x")).not.toBeNull();
  });

  it.skipIf(isJSDOM)(
    "is aria-hidden, with data-vertical or data-horizontal and touch-action: none",
    async () => {
      await render(() => <Area width={400} height={400} />);
      await settled();

      expect(scrollbar("y")).toHaveAttribute("aria-hidden", "true");
      expect(scrollbar("y")).toHaveAttribute("data-vertical", "");
      expect(scrollbar("y")).not.toHaveAttribute("data-horizontal");
      expect(scrollbar("x")).toHaveAttribute("data-horizontal", "");
      expect(scrollbar("x")).not.toHaveAttribute("data-vertical");
      expect(scrollbar("y")!.style.touchAction).toBe("none");
    },
  );

  it.skipIf(isJSDOM)(
    "has --thumb-size, the viewport's share of the content, and --thumb-position, following the scroll from 0 to 1",
    async () => {
      await render(() => <Area height={400} width={200} />);
      await settled();
      expect(variable("y", "--thumb-size")).toBe("25%");
      expect(variable("x", "--thumb-size")).toBe("50%");
      expect(variable("y", "--thumb-position")).toBe("0");

      viewport().scrollTop = 150;
      await settled();
      expect(variable("y", "--thumb-position")).toBe("0.5");

      viewport().scrollTop = 300;
      await settled();
      expect(variable("y", "--thumb-position")).toBe("1");
    },
  );

  it.skipIf(isJSDOM)(
    "has --thumb-position across as the distance from the start, right to left",
    async () => {
      await render(() => <Area dir="rtl" width={200} height={50} />);
      await settled();
      expect(variable("x", "--thumb-position")).toBe("0");

      viewport().scrollLeft = -25;
      await settled();
      expect(variable("x", "--thumb-position")).toBe("0.25");
      // The thumb, placed with inset-inline-start, starts at the right.
      const track = scrollbar("x")!.getBoundingClientRect();
      const thumb = scrollbar("x")!.firstElementChild!.getBoundingClientRect();
      expect(track.right - thumb.right).toBeCloseTo(12.5, 0);
    },
  );

  // The viewport is 100 px tall over 400 px of content: the thumb is 25 px
  // of a 100 px track, and a page is seven eighths of the viewport, 87.5 px,
  // which Chromium rounds to a whole pixel.
  const wait = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  it.skipIf(isJSDOM)(
    "scrolls a page towards a press on the track, below or above the thumb",
    async () => {
      await render(() => <Area />);
      await settled();

      await mouse("mousePressed", { x: 95, y: 80 });
      await mouse("mouseReleased", { x: 95, y: 80 });
      expect(viewport().scrollTop).toBe(88);

      await mouse("mousePressed", { x: 95, y: 5 });
      await mouse("mouseReleased", { x: 95, y: 5 });
      // 87.5 px back from 88.
      expect(viewport().scrollTop).toBe(1);
      viewport().scrollTop = 0;

      // Released before the press repeats, it scrolled once.
      await mouse("mousePressed", { x: 95, y: 95 });
      await mouse("mouseReleased", { x: 95, y: 95 });
      await wait(600);
      expect(viewport().scrollTop).toBe(88);
    },
  );

  it.skipIf(isJSDOM)(
    "scrolls a page again and again while the press is held, until the thumb reaches the pointer",
    async () => {
      await render(() => <Area />);
      await settled();

      await mouse("mousePressed", { x: 95, y: 60 });
      // Two pages put the thumb at 43.75 to 68.75 px, under the pointer.
      await wait(800);
      expect(viewport().scrollTop).toBe(176);
      await mouse("mouseReleased", { x: 95, y: 60 });
    },
  );

  it.skipIf(isJSDOM)(
    "puts the thumb's centre under a press with Shift or Alt, and goes on as a drag",
    async () => {
      await render(() => <Area />);
      await settled();
      const shift = 8;
      const alt = 1;

      await mouse("mousePressed", { x: 95, y: 60 }, { modifiers: shift });
      // The thumb's top at 47.5 px is 190 px scrolled.
      expect(viewport().scrollTop).toBe(190);
      await mouse("mouseMoved", { x: 95, y: 70 }, { modifiers: shift });
      expect(viewport().scrollTop).toBe(230);
      await mouse("mouseReleased", { x: 95, y: 70 });

      await mouse("mousePressed", { x: 95, y: 12.5 }, { modifiers: alt });
      await mouse("mouseReleased", { x: 95, y: 12.5 });
      expect(viewport().scrollTop).toBe(0);
    },
  );

  it.skipIf(isJSDOM)(
    "scrolls a page across towards a press on the track",
    async () => {
      await render(() => <Area width={400} height={50} />);
      await settled();

      await mouse("mousePressed", { x: 90, y: 95 });
      await mouse("mouseReleased", { x: 90, y: 95 });
      expect(viewport().scrollLeft).toBe(88);
    },
  );

  it.skipIf(isJSDOM)(
    "scrolls towards a press on the track right to left",
    async () => {
      await render(() => <Area dir="rtl" width={400} height={50} />);
      await settled();

      // The thumb is at the right end; the press is left of it.
      await mouse("mousePressed", { x: 10, y: 95 });
      await mouse("mouseReleased", { x: 10, y: 95 });
      expect(viewport().scrollLeft).toBe(-87);
    },
  );

  it.skipIf(isJSDOM)(
    "takes a new press after it was removed in the middle of a held press",
    async () => {
      const [height, setHeight] = createSignal(400);
      await render(() => <Area height={height()} />);
      await settled();

      await mouse("mousePressed", { x: 95, y: 95 });
      // The content shrinks under the held press, and the Scrollbar goes.
      setHeight(50);
      flush();
      await settled();
      expect(scrollbar("y")).toBeNull();
      await mouse("mouseReleased", { x: 95, y: 95 });

      setHeight(400);
      flush();
      await settled();
      viewport().scrollTop = 0;
      await settled();
      await mouse("mousePressed", { x: 95, y: 12 });
      await mouse("mouseMoved", { x: 95, y: 32 });
      await mouse("mouseReleased", { x: 95, y: 32 });
      expect(viewport().scrollTop).toBe(80);
    },
  );

  describe("with a page that scrolls", () => {
    afterEach(() => window.scrollTo(0, 0));

    it.skipIf(isJSDOM)(
      "scrolls the viewport for a wheel over it, and the page once the viewport is at its end",
      async () => {
        await render(() => (
          <>
            <Area />
            <div style={{ height: "3000px" }} />
          </>
        ));
        await settled();

        await wheel({ x: 95, y: 50 }, 100);
        expect(viewport().scrollTop).toBe(100);
        expect(window.scrollY).toBe(0);

        viewport().scrollTop = 300;
        await settled();
        await wheel({ x: 95, y: 50 }, 100);
        expect(viewport().scrollTop).toBe(300);
        await expect.poll(() => window.scrollY).toBeGreaterThan(0);
      },
    );
  });

  it("throws a descriptive error outside ScrollArea.Root", async () => {
    await render(() => (
      <Errored fallback={(error) => <p>{String(error())}</p>}>
        <ScrollArea.Scrollbar />
      </Errored>
    ));

    expect(
      screen.getByText(
        "Error: [menhir] ScrollArea parts must be placed within <ScrollArea.Root>.",
      ),
    ).toBeInTheDocument();
  });
});
