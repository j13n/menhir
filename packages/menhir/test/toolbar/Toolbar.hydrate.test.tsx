import { afterEach, describe, expect, it, vi } from "vitest";

import { createRenderer, renderOnServer, screen } from "#test-utils";

import ToolbarFixture from "./ToolbarFixture.tsx";

const fixture = "/test/toolbar/ToolbarFixture.tsx";
const button = (name: string) => screen.getByRole("button", { name });
const link = () => screen.getByRole("link", { name: "Help" });
const field = () => screen.getByRole("textbox", { name: "Font" });

describe("<Toolbar /> hydration", () => {
  const { render } = createRenderer();
  afterEach(() => vi.restoreAllMocks());

  it("is named, carries its state and has one tab stop, on the first item that is not disabled, in the server HTML", async () => {
    const container = await renderOnServer(fixture);

    const toolbar = screen.getByRole("toolbar", { name: "Formatting" });
    expect(toolbar).toHaveAttribute("data-horizontal", "");
    expect(toolbar).not.toHaveAttribute("aria-orientation");
    expect(button("Cut")).toHaveAttribute("aria-disabled", "true");
    expect(button("Cut")).toHaveAttribute("data-disabled", "");
    expect(button("Bold")).toHaveAttribute("aria-pressed", "false");
    expect(button("Cut")).toHaveAttribute("tabindex", "-1");
    expect(button("Bold")).toHaveAttribute("tabindex", "0");
    expect(link()).toHaveAttribute("tabindex", "-1");
    expect(field()).toHaveAttribute("tabindex", "-1");
    // Nothing hydrates it, so cleanup would not remove it.
    container.remove();
  });

  it("gives the first item of a disabled toolbar the tab stop in the server HTML", async () => {
    const container = await renderOnServer(
      "/test/toolbar/DisabledToolbarFixture.tsx",
    );

    expect(button("Cut")).toHaveAttribute("aria-disabled", "true");
    expect(button("Cut")).toHaveAttribute("tabindex", "0");
    expect(button("Copy")).toHaveAttribute("tabindex", "-1");
    container.remove();
  });

  it("adopts the server's elements, then moves focus, reaches a disabled item and presses", async () => {
    const container = await renderOnServer(fixture);
    const serverItems = [...container.querySelectorAll("button, a, input")];

    // A hydration mismatch is reported on the console, not thrown.
    const warn = vi.spyOn(console, "warn");
    const error = vi.spyOn(console, "error");
    const { user } = await render(() => <ToolbarFixture />, {
      hydrate: container,
    });
    expect(warn).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();

    expect([...container.querySelectorAll("button, a, input")]).toEqual(
      serverItems,
    );

    await user.keyboard("[Tab]");
    expect(button("Bold")).toHaveFocus();
    await user.keyboard("[Space]");
    expect(button("Bold")).toHaveAttribute("aria-pressed", "true");
    await user.keyboard("[ArrowRight]");
    expect(link()).toHaveFocus();
    // The disabled first item stays reachable.
    await user.keyboard("[ArrowLeft][ArrowLeft]");
    expect(button("Cut")).toHaveFocus();
    expect(button("Cut")).toHaveAttribute("tabindex", "0");
    await user.keyboard("[End]");
    expect(field()).toHaveFocus();
  });
});
