import { afterEach, describe, expect, it, vi } from "vitest";

import { createRenderer, renderOnServer, screen } from "#test-utils";

import RenderElementFixture from "./RenderElementFixture.tsx";

describe("renderElement hydration", () => {
  const { render } = createRenderer();
  afterEach(() => vi.restoreAllMocks());

  it("merges the part's class and style with the consumer's on the server", async () => {
    const container = await renderOnServer(
      "/test/core/RenderElementFixture.tsx",
    );
    const element = container.querySelector<HTMLElement>(
      "[data-testid=default]",
    );

    expect(element).toHaveClass("part mine", { exact: true });
    expect(element?.style.getPropertyValue("--part")).toBe("1");
    expect(element?.style.color).toBe("red");
    // Nothing hydrates it, so cleanup would not remove it.
    container.remove();
  });

  it.each([
    { testid: "default", tagName: "SPAN" },
    { testid: "tag", tagName: "A" },
    { testid: "component", tagName: "BUTTON" },
    { testid: "dynamic", tagName: "A" },
  ])(
    "adopts the server's element ($testid) and responds to clicks",
    async ({ testid, tagName }) => {
      const container = await renderOnServer(
        "/test/core/RenderElementFixture.tsx",
      );
      const serverElement = container.querySelector(`[data-testid=${testid}]`);

      // A hydration mismatch is reported on the console, not thrown.
      const warn = vi.spyOn(console, "warn");
      const error = vi.spyOn(console, "error");
      const { user } = await render(() => <RenderElementFixture />, {
        hydrate: container,
      });
      expect(warn).not.toHaveBeenCalled();
      expect(error).not.toHaveBeenCalled();

      const element = screen.getByTestId(testid);
      expect(element).toBe(serverElement);
      expect(element.tagName).toBe(tagName);
      expect(element).toHaveAttribute("aria-checked", "false");
      await user.click(element);
      expect(element).toHaveAttribute("aria-checked", "true");
    },
  );
});
