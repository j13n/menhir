import { afterEach, describe, expect, it, vi } from "vitest";

import { createRenderer, renderOnServer, screen } from "#test-utils";

import SwitchFixture from "./SwitchFixture.tsx";

describe("<Switch.Root /> hydration", () => {
  const { render } = createRenderer();
  afterEach(() => vi.restoreAllMocks());

  it("is labelled, and carries its state, in the server HTML", async () => {
    const container = await renderOnServer("/test/switch/SwitchFixture.tsx");

    const switchEl = screen.getByRole("switch", { name: "Wi-Fi" });
    expect(switchEl.tagName).toBe("BUTTON");
    expect(switchEl).toHaveAttribute("aria-checked", "true");
    expect(switchEl).toHaveAttribute("data-checked", "");
    expect(screen.getByTestId("thumb")).toHaveAttribute("data-checked", "");
    const input = screen.getByRole<HTMLInputElement>("checkbox", {
      hidden: true,
    });
    expect(input.checked).toBe(true);
    expect(input).toHaveAttribute("name", "wifi");
    // Nothing hydrates it, so cleanup would not remove it.
    container.remove();
  });

  it("adopts the server's elements and toggles afterwards", async () => {
    const container = await renderOnServer("/test/switch/SwitchFixture.tsx");
    const serverSwitch = container.querySelector("[role=switch]");
    const serverInput = container.querySelector("input");

    // A hydration mismatch is reported on the console, not thrown.
    const warn = vi.spyOn(console, "warn");
    const error = vi.spyOn(console, "error");
    const { user } = await render(() => <SwitchFixture />, {
      hydrate: container,
    });
    expect(warn).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();

    const switchEl = screen.getByRole("switch");
    expect(switchEl).toBe(serverSwitch);
    expect(screen.getByRole("checkbox", { hidden: true })).toBe(serverInput);

    await user.click(switchEl);
    expect(switchEl).toHaveAttribute("aria-checked", "false");
    expect(screen.getByTestId("thumb")).toHaveAttribute("data-unchecked", "");

    await user.keyboard("[Enter]");
    expect(switchEl).toHaveAttribute("aria-checked", "true");
  });
});
