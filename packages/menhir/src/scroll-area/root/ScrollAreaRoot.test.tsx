// The test list and the cases left out are in ../README.md. The layout and
// scrolling cases run in Chromium, since jsdom lays nothing out.
import { createSignal, flush } from "solid-js";
import { describe, expect, it } from "vitest";

import {
  createRenderer,
  describeConformance,
  isJSDOM,
  screen,
} from "#test-utils";

import {
  Area,
  content,
  root,
  settled,
  stubResizeObserver,
  thumb,
  viewport,
} from "../../../test/scroll-area/harness.tsx";
import { ScrollArea } from "../index.ts";

stubResizeObserver();

describeConformance(
  "<ScrollArea.Root />",
  (props) => <ScrollArea.Root {...props} />,
  { tagName: "DIV" },
);

describe("<ScrollArea.Root />", () => {
  const { render } = createRenderer();

  it("renders a div with its children", async () => {
    await render(() => <Area />);

    expect(root().tagName).toBe("DIV");
    expect(screen.getByTestId("block")).toBeInTheDocument();
  });

  it.skipIf(isJSDOM)(
    "has data-overflow-y while the content is taller than the viewport, and data-overflow-x while it is wider",
    async () => {
      const [height, setHeight] = createSignal(400);
      const [width, setWidth] = createSignal(50);
      await render(() => <Area height={height()} width={width()} />);
      await settled();

      expect(root()).toHaveAttribute("data-overflow-y", "");
      expect(root()).not.toHaveAttribute("data-overflow-x");

      setHeight(50);
      setWidth(300);
      flush();
      await settled();
      expect(root()).not.toHaveAttribute("data-overflow-y");
      expect(root()).toHaveAttribute("data-overflow-x", "");
    },
  );

  it.skipIf(isJSDOM)("counts overflow of 1 px or less as none", async () => {
    // With the system's scrollbars hidden, so that neither takes room.
    await render(() => <Area height={101} width={100.5} />);
    await settled();

    expect(root()).not.toHaveAttribute("data-overflow-y");
    expect(root()).not.toHaveAttribute("data-overflow-x");
  });

  it.skipIf(isJSDOM)(
    "has data-overflow-y-start once scrolled down, and data-overflow-y-end until the end",
    async () => {
      await render(() => <Area height={400} />);
      await settled();
      expect(root()).not.toHaveAttribute("data-overflow-y-start");
      expect(root()).toHaveAttribute("data-overflow-y-end", "");

      viewport().scrollTop = 150;
      await settled();
      expect(root()).toHaveAttribute("data-overflow-y-start", "");
      expect(root()).toHaveAttribute("data-overflow-y-end", "");

      viewport().scrollTop = 300;
      await settled();
      expect(root()).toHaveAttribute("data-overflow-y-start", "");
      expect(root()).not.toHaveAttribute("data-overflow-y-end");
    },
  );

  it.skipIf(isJSDOM)(
    "has data-overflow-x-start and data-overflow-x-end from the inline start, right to left too",
    async () => {
      await render(() => <Area dir="rtl" width={400} height={50} />);
      await settled();
      expect(root()).not.toHaveAttribute("data-overflow-x-start");
      expect(root()).toHaveAttribute("data-overflow-x-end", "");

      viewport().scrollLeft = -300;
      await settled();
      expect(root()).toHaveAttribute("data-overflow-x-start", "");
      expect(root()).not.toHaveAttribute("data-overflow-x-end");
    },
  );

  it.skipIf(isJSDOM)(
    "has data-scrolling while the viewport scrolls, cleared once it has stopped",
    async () => {
      await render(() => <Area />);
      await settled();
      expect(root()).not.toHaveAttribute("data-scrolling");

      viewport().scrollTop = 50;
      await settled();
      expect(root()).toHaveAttribute("data-scrolling", "");

      await new Promise((resolve) => setTimeout(resolve, 200));
      await settled();
      expect(root()).not.toHaveAttribute("data-scrolling");
    },
  );

  it.skipIf(isJSDOM)("puts the attributes on every part", async () => {
    await render(() => <Area />);
    await settled();
    viewport().scrollTop = 50;
    await settled();

    for (const part of [root(), viewport(), content(), thumb("y")]) {
      expect(part).toHaveAttribute("data-overflow-y", "");
      expect(part).toHaveAttribute("data-overflow-y-start", "");
      expect(part).toHaveAttribute("data-scrolling", "");
    }
    expect(screen.getByTestId("scrollbar-y")).toHaveAttribute(
      "data-overflow-y",
      "",
    );
  });
});
