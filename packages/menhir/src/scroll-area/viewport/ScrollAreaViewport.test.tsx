// The test list and the cases left out are in ../README.md.
import { Errored, createSignal, flush } from "solid-js";
import { describe, expect, it, vi } from "vitest";

import {
  createRenderer,
  describeConformance,
  isJSDOM,
  screen,
} from "#test-utils";

import {
  Area,
  noScrollbars,
  settled,
  stubResizeObserver,
  viewport,
} from "../../../test/scroll-area/harness.tsx";
import { keyboard } from "../../../test/floating/input.ts";
import { ScrollArea } from "../index.ts";

stubResizeObserver();

describeConformance(
  "<ScrollArea.Viewport />",
  (props) => (
    <ScrollArea.Root>
      <ScrollArea.Viewport {...props} />
    </ScrollArea.Root>
  ),
  { tagName: "DIV" },
);

describe("<ScrollArea.Viewport />", () => {
  const { render } = createRenderer();

  it("renders a div with role region, named by the consumer's aria-label", async () => {
    await render(() => <Area />);

    expect(viewport().tagName).toBe("DIV");
    expect(screen.getByRole("region", { name: "Notes" })).toBe(viewport());
  });

  it.skipIf(isJSDOM)(
    "has tabindex 0 while it overflows, and none while it fits",
    async () => {
      const [height, setHeight] = createSignal(400);
      await render(() => <Area height={height()} />);
      await settled();
      expect(viewport()).toHaveAttribute("tabindex", "0");

      setHeight(50);
      flush();
      await settled();
      expect(viewport()).not.toHaveAttribute("tabindex");
    },
  );

  it.skipIf(isJSDOM)("keeps the consumer's tabindex", async () => {
    await render(() => (
      <ScrollArea.Root>
        <ScrollArea.Viewport
          data-testid="viewport"
          tabindex={-1}
          style={{ overflow: "auto", height: "100px" }}
        >
          <ScrollArea.Content>
            <div style={{ height: "400px" }} />
          </ScrollArea.Content>
        </ScrollArea.Viewport>
      </ScrollArea.Root>
    ));
    await settled();

    expect(viewport()).toHaveAttribute("tabindex", "-1");
  });

  it.skipIf(isJSDOM)(
    "hides the system's scrollbars once a Scrollbar is mounted, and keeps them without one",
    async () => {
      const [scrollbars, setScrollbars] = createSignal<"both" | "none">("both");
      await render(() => <Area width={400} scrollbars={scrollbars()} />);
      await settled();
      expect(viewport().style.scrollbarWidth).toBe("none");
      expect(viewport().offsetWidth - viewport().clientWidth).toBe(0);

      setScrollbars("none");
      flush();
      await settled();
      expect(viewport().style.scrollbarWidth).toBe("");
      // Chromium in the tests draws classic scrollbars, which take room.
      expect(viewport().offsetWidth - viewport().clientWidth).toBeGreaterThan(
        0,
      );
    },
  );

  it.skipIf(isJSDOM)(
    "keeps the system's scrollbars, and renders no Scrollbar, where scrollbar-width: none is not supported",
    async () => {
      vi.spyOn(CSS, "supports").mockReturnValue(false);
      await render(() => <Area width={400} />);
      await settled();
      vi.restoreAllMocks();

      expect(viewport().style.scrollbarWidth).toBe("");
      expect(noScrollbars()).toBe(true);
    },
  );

  it.skipIf(isJSDOM)("scrolls with the keys once focused", async () => {
    await render(() => (
      <>
        <button type="button">Before</button>
        <Area />
      </>
    ));
    await settled();
    screen.getByRole("button", { name: "Before" }).focus();

    // Real keys: the browser scrolls only for a trusted key.
    await keyboard("{Tab}");
    expect(viewport()).toHaveFocus();
    await keyboard("{End}");
    // The browser animates a scroll by key.
    await expect.poll(() => viewport().scrollTop).toBe(300);
  });

  it("throws a descriptive error outside ScrollArea.Root", async () => {
    await render(() => (
      <Errored fallback={(error) => <p>{String(error())}</p>}>
        <ScrollArea.Viewport />
      </Errored>
    ));

    expect(
      screen.getByText(
        "Error: [menhir] ScrollArea parts must be placed within <ScrollArea.Root>.",
      ),
    ).toBeInTheDocument();
  });
});
