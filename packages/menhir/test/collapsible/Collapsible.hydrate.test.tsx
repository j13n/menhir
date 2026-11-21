import { afterEach, describe, expect, it, vi } from "vitest";

import { createRenderer, renderOnServer, screen } from "#test-utils";

import CollapsibleFixture from "./CollapsibleFixture.tsx";

const fixture = "/test/collapsible/CollapsibleFixture.tsx";

describe("<Collapsible.Root /> hydration", () => {
  const { render } = createRenderer();
  afterEach(() => vi.restoreAllMocks());

  it("links the Trigger to the Panel, and carries the state, in the server HTML", async () => {
    const container = await renderOnServer(fixture);

    const shipping = screen.getByRole("button", { name: "Shipping" });
    const shippingPanel = screen.getByText("Ships in two days.");
    expect(shipping).toHaveAttribute("type", "button");
    expect(shipping).toHaveAttribute("aria-expanded", "false");
    expect(shipping).toHaveAttribute("data-closed", "");
    expect(shippingPanel.id).not.toBe("");
    expect(shipping).toHaveAttribute("aria-controls", shippingPanel.id);
    expect(shippingPanel).toHaveAttribute("hidden");
    expect(shippingPanel).toHaveAttribute("data-closed", "");

    const returns = screen.getByRole("button", { name: "Returns" });
    const returnsPanel = screen.getByText("Free for 30 days.");
    expect(returns).toHaveAttribute("aria-expanded", "true");
    expect(returns).toHaveAttribute("aria-controls", returnsPanel.id);
    expect(returnsPanel).not.toHaveAttribute("hidden");
    expect(returnsPanel).toHaveAttribute("data-open", "");
    expect(returnsPanel.id).not.toBe(shippingPanel.id);
    // Nothing hydrates it, so cleanup would not remove it.
    container.remove();
  });

  it("adopts the server's elements and ids, and toggles afterwards", async () => {
    const container = await renderOnServer(fixture);
    const serverTrigger = container.querySelector("#shipping");
    const serverPanelIds = [
      ...container.querySelectorAll("[aria-controls]"),
    ].map((trigger) => trigger.getAttribute("aria-controls"));

    // A hydration mismatch is reported on the console, not thrown.
    const warn = vi.spyOn(console, "warn");
    const error = vi.spyOn(console, "error");
    const { user } = await render(() => <CollapsibleFixture />, {
      hydrate: container,
    });
    expect(warn).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();

    const trigger = screen.getByRole("button", { name: "Shipping" });
    const panel = screen.getByText("Ships in two days.");
    expect(trigger).toBe(serverTrigger);
    expect(
      screen.getAllByRole("button").map((t) => t.getAttribute("aria-controls")),
    ).toEqual(serverPanelIds);
    expect(panel.id).toBe(serverPanelIds[0]);

    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(panel).not.toHaveAttribute("hidden");
    expect(panel).toHaveAttribute("data-open", "");

    await user.keyboard("[Enter]");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(panel).toHaveAttribute("hidden");
  });
});
