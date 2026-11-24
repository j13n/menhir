import { afterEach, describe, expect, it, vi } from "vitest";

import {
  afterFlush,
  createRenderer,
  renderOnServer,
  screen,
} from "#test-utils";

import NumberFieldFixture from "./NumberFieldFixture.tsx";

const spinbutton = () =>
  screen.getByRole<HTMLInputElement>("spinbutton", { name: "Price" });
const hidden = () =>
  document.querySelector<HTMLInputElement>('input[type="number"]')!;
const price = () => screen.getByTestId("price").textContent;

describe("<NumberField.Root /> hydration", () => {
  const { render } = createRenderer();
  afterEach(() => vi.restoreAllMocks());

  it("has the spinbutton with its formatted text, its aria-value* and its label, and the hidden input with the plain number, in the server HTML", async () => {
    const container = await renderOnServer(
      "/test/number-field/NumberFieldFixture.tsx",
    );

    expect(spinbutton()).toHaveAttribute("value", "1.234,50\u00a0€");
    expect(spinbutton()).toHaveValue("1.234,50\u00a0€");
    expect(spinbutton()).toHaveAttribute("aria-valuenow", "1234.5");
    expect(spinbutton()).toHaveAttribute("aria-valuetext", "1.234,50\u00a0€");
    expect(spinbutton()).toHaveAttribute("aria-valuemin", "0");
    expect(spinbutton()).toHaveAttribute("aria-valuemax", "10000");
    expect(screen.getByRole("button", { name: "Increase" })).toHaveAttribute(
      "aria-controls",
      spinbutton().id,
    );
    expect(hidden()).toHaveAttribute("name", "price");
    expect(hidden()).toHaveAttribute("value", "1234.5");
    // Nothing hydrates it, so cleanup would not remove it.
    container.remove();
  });

  it("adopts the server's elements; a step and a commit change the value and the form's data afterwards", async () => {
    const container = await renderOnServer(
      "/test/number-field/NumberFieldFixture.tsx",
    );
    const serverInput = container.querySelector('[role="spinbutton"]');

    // A hydration mismatch is reported on the console, not thrown.
    const warn = vi.spyOn(console, "warn");
    const error = vi.spyOn(console, "error");
    const { user } = await render(() => <NumberFieldFixture />, {
      hydrate: container,
    });
    expect(warn).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
    expect(spinbutton()).toBe(serverInput);

    await user.click(screen.getByRole("button", { name: "Increase" }));
    await afterFlush();
    expect(price()).toBe("1235");
    expect(spinbutton()).toHaveValue("1.235,00\u00a0€");

    await user.clear(spinbutton());
    await user.type(spinbutton(), "99,5");
    await user.click(screen.getByRole("button", { name: "Next" }));
    await afterFlush();

    expect(price()).toBe("99.5");
    expect(spinbutton()).toHaveValue("99,50\u00a0€");
    expect(new FormData(container.querySelector("form")!).get("price")).toBe(
      "99.5",
    );
  });
});
