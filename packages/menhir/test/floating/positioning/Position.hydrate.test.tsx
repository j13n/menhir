import { afterEach, describe, expect, it, vi } from "vitest";

import { createRenderer, renderOnServer, screen } from "#test-utils";

import PositionFixture from "./PositionFixture.tsx";

const fixture = "/test/floating/positioning/PositionFixture.tsx";

describe("createPosition hydration", () => {
  const { render } = createRenderer();
  afterEach(() => vi.restoreAllMocks());

  it("computes nothing during a server render", async () => {
    const container = await renderOnServer(fixture);

    const popup = screen.getByTestId("popup");
    expect(popup).toHaveAttribute("popover", "manual");
    expect(popup.style.inset).toBe("");
    expect(popup).not.toHaveAttribute("data-side");
    expect(popup).not.toHaveAttribute("data-align");
    expect(popup.style.getPropertyValue("--anchor-width")).toBe("");
    expect(popup.style.getPropertyValue("--transform-origin")).toBe("");
    // Nothing hydrates it, so cleanup would not remove it.
    container.remove();
  });

  it("adopts the server's elements, and places the popup once it opens", async () => {
    const container = await renderOnServer(fixture);
    const serverPopup = screen.getByTestId("popup");

    // A hydration mismatch is reported on the console, not thrown.
    const warn = vi.spyOn(console, "warn");
    const error = vi.spyOn(console, "error");
    const { user } = await render(() => <PositionFixture />, {
      hydrate: container,
    });
    expect(warn).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
    const popup = screen.getByTestId("popup");
    expect(popup).toBe(serverPopup);
    expect(popup).not.toHaveAttribute("data-side");

    await user.click(screen.getByRole("button", { name: "Toggle" }));

    await vi.waitFor(() => expect(popup).toHaveAttribute("data-side", "top"));
    expect(popup).toHaveAttribute("data-align", "start");
    expect(popup.style.inset).toMatch(/^-?[\d.]+px auto auto -?[\d.]+px$/);
  });
});
