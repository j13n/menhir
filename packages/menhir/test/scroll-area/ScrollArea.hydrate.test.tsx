// The test list is in src/scroll-area/README.md.
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createRenderer,
  fireEvent,
  isJSDOM,
  renderOnServer,
  screen,
} from "#test-utils";

import ScrollAreaFixture from "./ScrollAreaFixture.tsx";
import { settled, stubResizeObserver } from "./harness.tsx";

const fixture = "/test/scroll-area/ScrollAreaFixture.tsx";

describe("<ScrollArea.Root /> hydration", () => {
  stubResizeObserver();
  const { render } = createRenderer();
  afterEach(() => vi.restoreAllMocks());

  it("has the named Viewport with the system's scrollbar and the Content, and no Scrollbar, in the server HTML", async () => {
    const container = await renderOnServer(fixture);

    const viewport = screen.getByRole("region", { name: "Release notes" });
    expect(viewport.id).toBe("viewport");
    expect(viewport.style.scrollbarWidth).toBe("");
    expect(viewport).not.toHaveAttribute("tabindex");
    expect(container.querySelector("#content")).toHaveStyle({
      "min-width": "fit-content",
    });
    expect(container.querySelector("#content")).toHaveTextContent("Note 4");
    expect(container.querySelector("#scrollbar")).toBeNull();
    expect(container.querySelector("#root")).not.toHaveAttribute(
      "data-overflow-y",
    );
    // Nothing hydrates it, so cleanup would not remove it.
    container.remove();
  });

  it("adopts the server's elements without warnings", async () => {
    const container = await renderOnServer(fixture);
    const serverViewport = container.querySelector("#viewport");

    // A hydration mismatch is reported on the console, not thrown.
    const warn = vi.spyOn(console, "warn");
    const error = vi.spyOn(console, "error");
    await render(() => <ScrollAreaFixture />, { hydrate: container });

    expect(warn).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
    expect(screen.getByRole("region", { name: "Release notes" })).toBe(
      serverViewport,
    );
  });

  it.skipIf(isJSDOM)(
    "hides the system's scrollbar once hydrated, shows its own, and follows content added afterwards",
    async () => {
      const container = await renderOnServer(fixture);
      const viewport = container.querySelector<HTMLElement>("#viewport")!;
      // Chromium in the tests draws classic scrollbars, which take room.
      expect(viewport.offsetWidth - viewport.clientWidth).toBeGreaterThan(0);

      await render(() => <ScrollAreaFixture />, { hydrate: container });
      await settled();
      expect(viewport.style.scrollbarWidth).toBe("none");
      expect(viewport.offsetWidth - viewport.clientWidth).toBe(0);
      expect(viewport).toHaveAttribute("tabindex", "0");
      const scrollbar = () =>
        container.querySelector<HTMLElement>("#scrollbar")!;
      expect(scrollbar().style.getPropertyValue("--thumb-size")).toBe("50%");

      fireEvent.click(screen.getByRole("button", { name: "More notes" }));
      await settled();
      expect(scrollbar().style.getPropertyValue("--thumb-size")).toBe("25%");
    },
  );
});
