import { afterEach, describe, expect, it, vi } from "vitest";

import { createRenderer, renderOnServer, screen } from "#test-utils";

import ToggleFixture from "./ToggleFixture.tsx";

describe("<Toggle.Root /> hydration", () => {
  const { render } = createRenderer();
  afterEach(() => vi.restoreAllMocks());

  it("is named, and carries its state, in the server HTML", async () => {
    const container = await renderOnServer("/test/toggle/ToggleFixture.tsx");

    const toggle = screen.getByRole("button", { name: "Bold" });
    expect(toggle).toHaveAttribute("type", "button");
    expect(toggle).toHaveAttribute("aria-pressed", "true");
    expect(toggle).toHaveAttribute("data-pressed", "");
    expect(toggle).not.toHaveAttribute("data-unpressed");
    // Nothing hydrates it, so cleanup would not remove it.
    container.remove();
  });

  it("adopts the server's element and toggles afterwards", async () => {
    const container = await renderOnServer("/test/toggle/ToggleFixture.tsx");
    const serverToggle = container.querySelector("#bold");

    // A hydration mismatch is reported on the console, not thrown.
    const warn = vi.spyOn(console, "warn");
    const error = vi.spyOn(console, "error");
    const { user } = await render(() => <ToggleFixture />, {
      hydrate: container,
    });
    expect(warn).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();

    const toggle = screen.getByRole("button", { name: "Bold" });
    expect(toggle).toBe(serverToggle);

    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-pressed", "false");
    expect(toggle).toHaveAttribute("data-unpressed", "");

    await user.keyboard("[Enter]");
    expect(toggle).toHaveAttribute("aria-pressed", "true");
  });
});
