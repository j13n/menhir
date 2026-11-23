import { afterEach, describe, expect, it, vi } from "vitest";

import {
  afterFlush,
  createRenderer,
  renderOnServer,
  screen,
} from "#test-utils";

import InputFixture from "./InputFixture.tsx";

const textbox = () =>
  screen.getByRole<HTMLInputElement>("textbox", { name: "City" });
const text = () => screen.getByTestId("text").textContent;

/** Resolves once the Input has handled a form reset, in a task after it. */
async function afterReset() {
  await new Promise((resolve) => setTimeout(resolve));
  await afterFlush();
}

describe("<Input.Root /> hydration", () => {
  const { render } = createRenderer();
  afterEach(() => vi.restoreAllMocks());

  it("has the controlled text as the value attribute, labelled in a Field, in the server HTML", async () => {
    const container = await renderOnServer("/test/input/InputFixture.tsx");

    expect(textbox()).toHaveAttribute("value", "Oslo");
    expect(textbox()).toHaveValue("Oslo");
    expect(textbox()).toHaveAttribute("name", "city");
    // Nothing hydrates it, so cleanup would not remove it.
    container.remove();
  });

  it("adopts the server's element; after an edit, a reset puts it back to the app's default, not to the server's text", async () => {
    const container = await renderOnServer("/test/input/InputFixture.tsx");
    const serverInput = container.querySelector("input");

    // A hydration mismatch is reported on the console, not thrown.
    const warn = vi.spyOn(console, "warn");
    const error = vi.spyOn(console, "error");
    const { user } = await render(() => <InputFixture />, {
      hydrate: container,
    });
    expect(warn).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
    expect(textbox()).toBe(serverInput);

    await user.type(textbox(), "!");
    expect(text()).toBe("Oslo!");

    // The browser resets the element to the server's `value` attribute.
    await user.click(screen.getByRole("button", { name: "Reset" }));
    await afterReset();

    expect(text()).toBe("");
    expect(textbox()).toHaveValue("");

    // At its default already, the app's text is not asked to change, and
    // the element still follows it.
    await user.click(screen.getByRole("button", { name: "Reset" }));
    await afterReset();

    expect(textbox()).toHaveValue("");
  });
});
