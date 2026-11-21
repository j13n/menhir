import { afterEach, describe, expect, it, vi } from "vitest";

import { createRenderer, renderOnServer, screen } from "#test-utils";

import TabsFixture from "./TabsFixture.tsx";

const fixture = "/test/tabs/TabsFixture.tsx";
const tab = (name: string) => screen.getByRole("tab", { name });
const panel = (name: string) => screen.getByText(`${name} panel`);

describe("<Tabs /> hydration", () => {
  const { render } = createRenderer();
  afterEach(() => vi.restoreAllMocks());

  it("links each tab and panel, carries the state and has one tab stop, in the server HTML", async () => {
    const container = await renderOnServer(fixture);

    expect(screen.getByRole("tablist", { name: "Settings" })).toHaveAttribute(
      "data-horizontal",
      "",
    );
    expect(tab("Account")).toHaveAttribute("type", "button");
    expect(tab("Account")).toHaveAttribute("aria-disabled", "true");
    expect(tab("Account")).toHaveAttribute("aria-selected", "false");
    expect(tab("Billing")).toHaveAttribute("aria-selected", "true");
    expect(tab("Billing")).toHaveAttribute("data-selected", "");
    expect(tab("Security")).toHaveAttribute("data-unselected", "");
    expect(tab("Account")).toHaveAttribute("tabindex", "-1");
    expect(tab("Billing")).toHaveAttribute("tabindex", "0");
    expect(tab("Security")).toHaveAttribute("tabindex", "-1");
    for (const name of ["Account", "Billing", "Security"]) {
      expect(panel(name).id).not.toBe("");
      expect(tab(name)).toHaveAttribute("aria-controls", panel(name).id);
      expect(tab(name).id).not.toBe("");
      expect(panel(name)).toHaveAttribute("aria-labelledby", tab(name).id);
      expect(panel(name)).toHaveAttribute("role", "tabpanel");
    }
    expect(tab("Security")).toHaveAttribute("id", "security");
    expect(panel("Account")).toHaveAttribute("hidden");
    expect(panel("Billing")).not.toHaveAttribute("hidden");
    expect(panel("Billing")).toHaveAttribute("data-selected", "");
    expect(panel("Security")).toHaveAttribute("hidden");
    // Nothing hydrates it, so cleanup would not remove it.
    container.remove();
  });

  it("adopts the server's elements and ids, then moves focus and selects", async () => {
    const container = await renderOnServer(fixture);
    const serverTabs = [...container.querySelectorAll("button")];
    const serverIds = [...container.querySelectorAll("[id]")].map(
      (element) => element.id,
    );

    // A hydration mismatch is reported on the console, not thrown.
    const warn = vi.spyOn(console, "warn");
    const error = vi.spyOn(console, "error");
    const { user } = await render(() => <TabsFixture />, {
      hydrate: container,
    });
    expect(warn).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();

    expect(screen.getAllByRole("tab")).toEqual(serverTabs);
    expect([...container.querySelectorAll("[id]")].map((e) => e.id)).toEqual(
      serverIds,
    );
    expect(tab("Billing")).toHaveAttribute("tabindex", "0");

    await user.keyboard("[Tab]");
    expect(tab("Billing")).toHaveFocus();
    await user.keyboard("[ArrowRight]");
    expect(tab("Security")).toHaveFocus();
    expect(tab("Security")).toHaveAttribute("aria-selected", "true");
    expect(tab("Security")).toHaveAttribute("tabindex", "0");
    expect(panel("Security")).not.toHaveAttribute("hidden");
    expect(panel("Billing")).toHaveAttribute("hidden");

    // Wraps to the disabled first tab, which is not selected.
    await user.keyboard("[ArrowRight]");
    expect(tab("Account")).toHaveFocus();
    expect(tab("Security")).toHaveAttribute("aria-selected", "true");

    await user.click(tab("Billing"));
    expect(tab("Billing")).toHaveAttribute("aria-selected", "true");
    expect(panel("Billing")).not.toHaveAttribute("hidden");
  });
});
