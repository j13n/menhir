import { afterEach, describe, expect, it, vi } from "vitest";

import { createRenderer, renderOnServer, screen } from "#test-utils";

import FieldsetFixture from "./FieldsetFixture.tsx";

describe("Fieldset recipe hydration", () => {
  const { render } = createRenderer();
  afterEach(() => vi.restoreAllMocks());

  it("names and describes the group in the server HTML, with no error", async () => {
    const container = await renderOnServer(
      "/test/fieldset/FieldsetFixture.tsx",
    );

    const group = screen.getByRole("group", { name: "Delivery" });
    expect(group.tagName).toBe("FIELDSET");
    expect(group).toHaveAttribute("name", "delivery");
    expect(group).toHaveAccessibleDescription("We ship within two days.");
    expect(group).not.toHaveAttribute("aria-invalid");
    expect(group).not.toHaveAttribute("data-invalid");
    expect(screen.queryByTestId("error")).toBeNull();
    // Nothing hydrates it, so cleanup would not remove it.
    container.remove();
  });

  it("adopts the server's elements, and shows the error once the group is left", async () => {
    const container = await renderOnServer(
      "/test/fieldset/FieldsetFixture.tsx",
    );
    const serverFieldset = container.querySelector("fieldset");

    // A hydration mismatch is reported on the console, not thrown.
    const warn = vi.spyOn(console, "warn");
    const error = vi.spyOn(console, "error");
    const { user } = await render(() => <FieldsetFixture />, {
      hydrate: container,
    });
    expect(warn).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();

    const group = screen.getByRole("group", { name: "Delivery" });
    expect(group).toBe(serverFieldset);
    const standard = screen.getByRole("radio", { name: "Standard" });
    const message = (standard as HTMLInputElement).validationMessage;

    standard.focus();
    await user.tab();

    expect(group).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByTestId("error")).toHaveTextContent(message);
    expect(group).toHaveAccessibleDescription(
      `We ship within two days. ${message}`,
    );
  });
});
