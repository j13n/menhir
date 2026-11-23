import { afterEach, describe, expect, it, vi } from "vitest";

import { createRenderer, renderOnServer, screen } from "#test-utils";

import FieldFixture from "./FieldFixture.tsx";

describe("<Field.Root /> hydration", () => {
  const { render } = createRenderer();
  afterEach(() => vi.restoreAllMocks());

  it("labels and describes the control in the server HTML, with no error", async () => {
    const container = await renderOnServer("/test/field/FieldFixture.tsx");

    const control = screen.getByRole("textbox", { name: "Email" });
    const label = screen.getByText("Email");
    expect(control.id).not.toBe("");
    expect(label).toHaveAttribute("for", control.id);
    expect(control).toHaveAttribute("name", "email");
    expect(control).toHaveAccessibleDescription("For receipts.");
    expect(control).not.toHaveAttribute("aria-invalid");
    expect(screen.getByTestId("root")).not.toHaveAttribute("data-invalid");
    expect(screen.queryByTestId("error")).toBeNull();
    // Nothing hydrates it, so cleanup would not remove it.
    container.remove();
  });

  it("adopts the server's elements, and shows the error once the control is left", async () => {
    const container = await renderOnServer("/test/field/FieldFixture.tsx");
    const serverControl = container.querySelector("input");

    // A hydration mismatch is reported on the console, not thrown.
    const warn = vi.spyOn(console, "warn");
    const error = vi.spyOn(console, "error");
    const { user } = await render(() => <FieldFixture />, {
      hydrate: container,
    });
    expect(warn).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();

    const control = screen.getByRole("textbox", { name: "Email" });
    expect(control).toBe(serverControl);
    expect(control).toHaveAccessibleDescription("For receipts.");

    await user.click(control);
    await user.tab();

    expect(control).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByTestId("error")).toHaveTextContent(
      (control as HTMLInputElement).validationMessage,
    );
    expect(control).toHaveAccessibleDescription(
      `For receipts. ${(control as HTMLInputElement).validationMessage}`,
    );
  });
});
