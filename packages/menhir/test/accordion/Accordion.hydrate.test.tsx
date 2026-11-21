import { afterEach, describe, expect, it, vi } from "vitest";

import { createRenderer, renderOnServer, screen } from "#test-utils";

import AccordionFixture from "./AccordionFixture.tsx";

const fixture = "/test/accordion/AccordionFixture.tsx";

describe("<Accordion.Root /> hydration", () => {
  const { render } = createRenderer();
  afterEach(() => vi.restoreAllMocks());

  it("links each Trigger and Panel, and carries the state, in the server HTML", async () => {
    const container = await renderOnServer(fixture);

    const shipping = screen.getByRole("button", { name: "Shipping" });
    const shippingPanel = screen.getByText("Ships in two days.");
    expect(screen.getByRole("heading", { level: 3, name: "Shipping" })).toBe(
      shipping.parentElement,
    );
    expect(shipping).toHaveAttribute("type", "button");
    expect(shipping).toHaveAttribute("aria-expanded", "false");
    expect(shipping).toHaveAttribute("data-closed", "");
    expect(shippingPanel.id).not.toBe("");
    expect(shipping).toHaveAttribute("aria-controls", shippingPanel.id);
    expect(shippingPanel).toHaveAttribute("role", "region");
    expect(shippingPanel).toHaveAttribute("aria-labelledby", "shipping");
    expect(shippingPanel).toHaveAttribute("hidden");
    expect(shippingPanel).toHaveAttribute("data-closed", "");

    const returns = screen.getByRole("button", { name: "Returns" });
    const returnsPanel = screen.getByText("Free for 30 days.");
    expect(returns).toHaveAttribute("aria-expanded", "true");
    expect(returns).toHaveAttribute("aria-controls", returnsPanel.id);
    expect(returns.id).not.toBe("");
    expect(returnsPanel).toHaveAttribute("aria-labelledby", returns.id);
    expect(returnsPanel).not.toHaveAttribute("hidden");
    expect(returnsPanel).toHaveAttribute("data-open", "");
    expect(returnsPanel.id).not.toBe(shippingPanel.id);
    // Nothing hydrates it, so cleanup would not remove it.
    container.remove();
  });

  it("adopts the server's elements and ids, and opens sections afterwards", async () => {
    const container = await renderOnServer(fixture);
    const serverTrigger = container.querySelector("#shipping");
    const serverIds = [...container.querySelectorAll("[id]")].map(
      (element) => element.id,
    );

    // A hydration mismatch is reported on the console, not thrown.
    const warn = vi.spyOn(console, "warn");
    const error = vi.spyOn(console, "error");
    const { user } = await render(() => <AccordionFixture />, {
      hydrate: container,
    });
    expect(warn).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();

    const shipping = screen.getByRole("button", { name: "Shipping" });
    const returns = screen.getByRole("button", { name: "Returns" });
    const panel = screen.getByText("Ships in two days.");
    expect(shipping).toBe(serverTrigger);
    expect([...container.querySelectorAll("[id]")].map((e) => e.id)).toEqual(
      serverIds,
    );

    await user.click(shipping);
    expect(shipping).toHaveAttribute("aria-expanded", "true");
    expect(panel).not.toHaveAttribute("hidden");
    expect(panel).toHaveAttribute("data-open", "");
    expect(returns).toHaveAttribute("aria-expanded", "false");

    await user.keyboard("[Enter]");
    expect(shipping).toHaveAttribute("aria-expanded", "false");
    expect(panel).toHaveAttribute("hidden");
  });
});
