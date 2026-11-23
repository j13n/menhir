import { afterEach, describe, expect, it, vi } from "vitest";

import { createRenderer, renderOnServer, screen } from "#test-utils";

import CheckboxFieldFixture from "./CheckboxFieldFixture.tsx";
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

describe("<Checkbox.Root /> in a Field, hydration", () => {
  const { render } = createRenderer();
  afterEach(() => vi.restoreAllMocks());
  const control = () => screen.getByRole("checkbox", { name: "Accept terms" });
  const hiddenInput = () =>
    document.querySelector<HTMLInputElement>("input[name=terms]")!;

  it("is labelled and described by the Field in the server HTML, with no error", async () => {
    const container = await renderOnServer(
      "/test/checkbox/CheckboxFieldFixture.tsx",
    );

    expect(control().tagName).toBe("BUTTON");
    expect(control().id).not.toBe("");
    expect(screen.getByText("Accept terms")).toHaveAttribute(
      "for",
      control().id,
    );
    expect(control()).toHaveAccessibleDescription("Read them first.");
    expect(hiddenInput()).toHaveAttribute("required");
    expect(control()).not.toHaveAttribute("aria-invalid");
    expect(screen.getByTestId("root")).not.toHaveAttribute("data-invalid");
    expect(screen.queryByTestId("error")).toBeNull();
    // Nothing hydrates it, so cleanup would not remove it.
    container.remove();
  });

  it("adopts the server's elements; a blocked submission shows the error, and a label click checks it", async () => {
    const container = await renderOnServer(
      "/test/checkbox/CheckboxFieldFixture.tsx",
    );
    const serverControl = container.querySelector("[role=checkbox]");
    const serverInput = container.querySelector("input[name=terms]");

    // A hydration mismatch is reported on the console, not thrown.
    const warn = vi.spyOn(console, "warn");
    const error = vi.spyOn(console, "error");
    const { user } = await render(() => <CheckboxFieldFixture />, {
      hydrate: container,
    });
    expect(warn).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
    expect(control()).toBe(serverControl);
    expect(hiddenInput()).toBe(serverInput);

    await user.click(screen.getByRole("button", { name: "Send" }));

    expect(control()).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByTestId("error")).toHaveTextContent(
      hiddenInput().validationMessage,
    );
    expect(screen.getByTestId("indicator").closest("[data-invalid]")).toBe(
      control(),
    );

    await user.click(screen.getByText("Accept terms"));

    expect(control()).toHaveAttribute("aria-checked", "true");
    expect(control()).not.toHaveAttribute("aria-invalid");
    expect(screen.queryByTestId("error")).toBeNull();
  });
});
