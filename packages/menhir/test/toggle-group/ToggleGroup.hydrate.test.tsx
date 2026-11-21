import { afterEach, describe, expect, it, vi } from "vitest";

import { createRenderer, renderOnServer, screen } from "#test-utils";

import ToggleGroupFixture from "./ToggleGroupFixture.tsx";

const fixture = "/test/toggle-group/ToggleGroupFixture.tsx";
const item = (name: string) => screen.getByRole("button", { name });

describe("<ToggleGroup /> hydration", () => {
  const { render } = createRenderer();
  afterEach(() => vi.restoreAllMocks());

  it("is named, carries its state and has one tab stop, on the first enabled item, in the server HTML", async () => {
    const container = await renderOnServer(fixture);

    const group = screen.getByRole("group", { name: "Format" });
    expect(group).toHaveAttribute("data-horizontal", "");
    expect(item("Bold")).toHaveAttribute("type", "button");
    expect(item("Bold")).toBeDisabled();
    expect(item("Bold")).toHaveAttribute("data-disabled", "");
    expect(item("Underline")).toHaveAttribute("aria-pressed", "false");
    expect(item("Underline")).toHaveAttribute("data-unpressed", "");
    expect(item("Italic")).toHaveAttribute("aria-pressed", "true");
    expect(item("Italic")).toHaveAttribute("data-pressed", "");
    expect(item("Bold")).toHaveAttribute("tabindex", "-1");
    expect(item("Italic")).toHaveAttribute("tabindex", "0");
    expect(item("Underline")).toHaveAttribute("tabindex", "-1");
    // Nothing hydrates it, so cleanup would not remove it.
    container.remove();
  });

  it("adopts the server's elements, then moves focus and presses", async () => {
    const container = await renderOnServer(fixture);
    const serverItems = [...container.querySelectorAll("button")];

    // A hydration mismatch is reported on the console, not thrown.
    const warn = vi.spyOn(console, "warn");
    const error = vi.spyOn(console, "error");
    const { user } = await render(() => <ToggleGroupFixture />, {
      hydrate: container,
    });
    expect(warn).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();

    expect(screen.getAllByRole("button")).toEqual(serverItems);
    expect(item("Italic")).toHaveAttribute("tabindex", "0");

    await user.keyboard("[Tab]");
    expect(item("Italic")).toHaveFocus();
    await user.keyboard("[ArrowRight][Space]");
    expect(item("Underline")).toHaveFocus();
    expect(item("Underline")).toHaveAttribute("aria-pressed", "true");
    expect(item("Underline")).toHaveAttribute("tabindex", "0");
    expect(item("Italic")).toHaveAttribute("tabindex", "-1");

    // Wraps past the disabled first item.
    await user.keyboard("[ArrowRight]");
    expect(item("Italic")).toHaveFocus();
    await user.click(item("Italic"));
    expect(item("Italic")).toHaveAttribute("aria-pressed", "false");
  });
});
