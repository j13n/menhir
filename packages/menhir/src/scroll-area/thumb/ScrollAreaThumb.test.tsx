// The test list and the cases left out are in ../README.md. The pointer
// cases send real input to Chromium, since jsdom lays nothing out.
import { Errored } from "solid-js";
import { describe, expect, it } from "vitest";

import {
  createRenderer,
  describeConformance,
  isJSDOM,
  screen,
} from "#test-utils";

import {
  Area,
  mouse,
  settled,
  stubOverflowingLayout,
  stubResizeObserver,
  thumb,
  touch,
  viewport,
} from "../../../test/scroll-area/harness.tsx";
import { ScrollArea } from "../index.ts";

if (isJSDOM) {
  // A Thumb renders once the area has measured an overflow, which only the
  // stand-in layout gives at once.
  describe("conformance", () => {
    stubOverflowingLayout();
    describeConformance(
      "<ScrollArea.Thumb />",
      (props) => (
        <ScrollArea.Root>
          <ScrollArea.Viewport>
            <ScrollArea.Content />
          </ScrollArea.Viewport>
          <ScrollArea.Scrollbar>
            <ScrollArea.Thumb {...props} />
          </ScrollArea.Scrollbar>
        </ScrollArea.Root>
      ),
      { tagName: "DIV" },
    );
  });
}

describe("<ScrollArea.Thumb />", () => {
  stubResizeObserver();
  const { render } = createRenderer();

  it.skipIf(isJSDOM)(
    "renders a div with its Scrollbar's data-vertical or data-horizontal",
    async () => {
      await render(() => <Area width={400} height={400} />);
      await settled();

      expect(thumb("y").tagName).toBe("DIV");
      expect(thumb("y")).toHaveAttribute("data-vertical", "");
      expect(thumb("x")).toHaveAttribute("data-horizontal", "");
      expect(thumb("x")).not.toHaveAttribute("data-vertical");
    },
  );

  // The viewport is 100 px tall over 400 px of content, so the thumb is
  // 25 px of a 100 px track, and each pixel it moves scrolls 300 / 75 = 4.
  it.skipIf(isJSDOM)(
    "scrolls the viewport by four pixels for each pixel it is dragged, outside the scrollbar too, until released",
    async () => {
      await render(() => <Area />);
      await settled();

      await mouse("mousePressed", { x: 95, y: 12 });
      await mouse("mouseMoved", { x: 95, y: 32 });
      expect(viewport().scrollTop).toBe(80);
      await mouse("mouseMoved", { x: 300, y: 52 });
      expect(viewport().scrollTop).toBe(160);
      await mouse("mouseMoved", { x: 300, y: 500 });
      expect(viewport().scrollTop).toBe(300);
      await mouse("mouseReleased", { x: 300, y: 500 });

      await mouse("mouseMoved", { x: 95, y: 12 }, { buttons: 0 });
      expect(viewport().scrollTop).toBe(300);
    },
  );

  it.skipIf(isJSDOM)("scrolls across when dragged across", async () => {
    await render(() => <Area width={400} height={50} />);
    await settled();

    await mouse("mousePressed", { x: 12, y: 95 });
    await mouse("mouseMoved", { x: 32, y: 95 });
    await mouse("mouseReleased", { x: 32, y: 95 });

    expect(viewport().scrollLeft).toBe(80);
  });

  it.skipIf(isJSDOM)(
    "scrolls towards the pointer when dragged across, right to left",
    async () => {
      await render(() => <Area dir="rtl" width={400} height={50} />);
      await settled();
      // Right to left the thumb starts at the right end of the track.
      const { left, width } = thumb("x").getBoundingClientRect();
      expect(left).toBe(75);
      expect(width).toBe(25);

      await mouse("mousePressed", { x: 87, y: 95 });
      await mouse("mouseMoved", { x: 67, y: 95 });
      await mouse("mouseReleased", { x: 67, y: 95 });

      expect(viewport().scrollLeft).toBe(-80);
    },
  );

  it.skipIf(isJSDOM)(
    "scrolls the viewport, and not the page, when dragged by touch",
    async () => {
      await render(() => (
        <>
          <Area />
          <div style={{ height: "3000px" }} />
        </>
      ));
      await settled();

      await touch("touchStart", { x: 95, y: 12 });
      await touch("touchMove", { x: 95, y: 22 });
      await touch("touchMove", { x: 95, y: 32 });
      await touch("touchEnd");

      expect(viewport().scrollTop).toBe(80);
      expect(window.scrollY).toBe(0);
    },
  );

  it.skipIf(isJSDOM)(
    "selects nothing and moves no focus when pressed",
    async () => {
      await render(() => (
        <>
          <Area />
          <p style={{ "margin-top": "120px" }}>Some text</p>
          <button type="button">Elsewhere</button>
        </>
      ));
      await settled();
      const elsewhere = screen.getByRole("button", { name: "Elsewhere" });
      elsewhere.focus();

      await mouse("mousePressed", { x: 95, y: 12 });
      await mouse("mouseMoved", { x: 95, y: 200 });
      await mouse("mouseReleased", { x: 95, y: 200 });

      expect(elsewhere).toHaveFocus();
      expect(window.getSelection()?.toString()).toBe("");
    },
  );

  it("throws a descriptive error outside ScrollArea.Scrollbar", async () => {
    await render(() => (
      <Errored fallback={(error) => <p>{String(error())}</p>}>
        <ScrollArea.Root>
          <ScrollArea.Thumb />
        </ScrollArea.Root>
      </Errored>
    ));

    expect(
      screen.getByText(
        "Error: [menhir] ScrollArea.Thumb must be placed within <ScrollArea.Scrollbar>.",
      ),
    ).toBeInTheDocument();
  });
});
