// The test list and the cases left out are in ../README.md.
import { createSignal, flush } from "solid-js";
import { describe, expect, it } from "vitest";

import { createRenderer, describeConformance, isJSDOM } from "#test-utils";

import {
  Area,
  content,
  root,
  scrollbar,
  settled,
  stubResizeObserver,
} from "../../../test/scroll-area/harness.tsx";
import { ScrollArea } from "../index.ts";

stubResizeObserver();

describeConformance(
  "<ScrollArea.Content />",
  (props) => (
    <ScrollArea.Root>
      <ScrollArea.Viewport>
        <ScrollArea.Content {...props} />
      </ScrollArea.Viewport>
    </ScrollArea.Root>
  ),
  { tagName: "DIV" },
);

describe("<ScrollArea.Content />", () => {
  const { render } = createRenderer();

  it("renders a div with min-width: fit-content", async () => {
    await render(() => <Area />);

    expect(content().tagName).toBe("DIV");
    expect(content().style.minWidth).toBe("fit-content");
  });

  it.skipIf(isJSDOM)(
    "has the thumb follow content that grows and shrinks inside a viewport that keeps its size",
    async () => {
      const [height, setHeight] = createSignal(200);
      await render(() => <Area height={height()} />);
      await settled();
      const size = () => scrollbar("y")!.style.getPropertyValue("--thumb-size");
      expect(size()).toBe("50%");

      setHeight(500);
      flush();
      await settled();
      expect(size()).toBe("20%");

      setHeight(400);
      flush();
      await settled();
      expect(size()).toBe("25%");
    },
  );

  it.skipIf(isJSDOM)(
    "widens with content that grows wider than the viewport, which then overflows across",
    async () => {
      const [wide, setWide] = createSignal(false);
      await render(() => (
        <Area>
          <p style={{ "white-space": "nowrap", margin: 0 }}>
            {wide()
              ? "A line far too long to fit in a hundred pixels"
              : "Short"}
          </p>
        </Area>
      ));
      await settled();
      expect(root()).not.toHaveAttribute("data-overflow-x");

      // Only the Content's own size tells the area: the viewport keeps its.
      setWide(true);
      flush();
      await settled();
      expect(content().getBoundingClientRect().width).toBeGreaterThan(100);
      expect(root()).toHaveAttribute("data-overflow-x", "");
      expect(scrollbar("x")).not.toBeNull();
    },
  );
});
