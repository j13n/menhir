import { afterEach, describe, expect, it, vi } from "vitest";

import { createRenderer, renderOnServer, screen } from "#test-utils";

import CheckboxFixture from "./CheckboxFixture.tsx";

describe("<Checkbox.Root /> hydration", () => {
  const { render } = createRenderer();
  afterEach(() => vi.restoreAllMocks());

  it("is labelled, and carries its state, in the server HTML", async () => {
    const container = await renderOnServer(
      "/test/checkbox/CheckboxFixture.tsx",
    );

    const checkbox = screen.getByRole("checkbox", { name: "Accept terms" });
    expect(checkbox.tagName).toBe("BUTTON");
    expect(checkbox).toHaveAttribute("aria-checked", "true");
    expect(checkbox).toHaveAttribute("data-checked", "");
    expect(screen.getByTestId("indicator")).toHaveAttribute("data-checked", "");
    const mixed = screen.getByRole("checkbox", { name: "All options" });
    expect(mixed).toHaveAttribute("aria-checked", "mixed");
    expect(mixed).toHaveAttribute("data-indeterminate", "");
    const input =
      container.querySelector<HTMLInputElement>("input[name=terms]")!;
    expect(input.type).toBe("checkbox");
    expect(input.checked).toBe(true);
    // Nothing hydrates it, so cleanup would not remove it.
    container.remove();
  });

  it("adopts the server's elements and toggles afterwards", async () => {
    const container = await renderOnServer(
      "/test/checkbox/CheckboxFixture.tsx",
    );
    const serverCheckbox = container.querySelector("#terms");
    const serverInput = container.querySelector("input[name=terms]");

    // A hydration mismatch is reported on the console, not thrown.
    const warn = vi.spyOn(console, "warn");
    const error = vi.spyOn(console, "error");
    const { user } = await render(() => <CheckboxFixture />, {
      hydrate: container,
    });
    expect(warn).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();

    const checkbox = screen.getByRole("checkbox", { name: "Accept terms" });
    expect(checkbox).toBe(serverCheckbox);
    expect(document.querySelector("input[name=terms]")).toBe(serverInput);

    await user.click(checkbox);
    expect(checkbox).toHaveAttribute("aria-checked", "false");
    expect(screen.getByTestId("indicator")).toHaveAttribute(
      "data-unchecked",
      "",
    );

    await user.keyboard("[Space]");
    expect(checkbox).toHaveAttribute("aria-checked", "true");
  });
});
