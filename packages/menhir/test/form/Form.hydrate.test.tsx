import { afterEach, describe, expect, it, vi } from "vitest";

import {
  afterFlush,
  createRenderer,
  renderOnServer,
  screen,
} from "#test-utils";

import FormFixture from "./FormFixture.tsx";

const email = () => screen.getByRole("textbox", { name: "Email" });
const emailError = () => screen.queryByTestId("error-email");

describe("<Form /> hydration", () => {
  const { render } = createRenderer();
  afterEach(() => vi.restoreAllMocks());

  it("has no novalidate in the server HTML, and the errors passed in rendered in their Fields", async () => {
    const container = await renderOnServer("/test/form/FormFixture.tsx");
    const formElement = container.querySelector("form")!;

    // The browser validates a submission made before hydration itself.
    expect(formElement).not.toHaveAttribute("novalidate");
    expect(formElement).toHaveAttribute("method", "post");
    expect(email()).toHaveAttribute("aria-invalid", "true");
    expect(emailError()).toHaveTextContent("Taken");
    // No submission touched the city Field: the browser's error waits.
    expect(screen.queryByTestId("error-city")).not.toBeInTheDocument();
    // Nothing hydrates it, so cleanup would not remove it.
    container.remove();
  });

  it("adopts the server's elements, sets novalidate, and hides an error once its control is edited", async () => {
    const container = await renderOnServer("/test/form/FormFixture.tsx");
    const serverInput = container.querySelector("input");

    // A hydration mismatch is reported on the console, not thrown.
    const warn = vi.spyOn(console, "warn");
    const error = vi.spyOn(console, "error");
    const { user } = await render(() => <FormFixture />, {
      hydrate: container,
    });
    expect(warn).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
    expect(email()).toBe(serverInput);
    expect(container.querySelector("form")).toHaveAttribute("novalidate");
    expect(email()).toHaveAccessibleDescription("Taken");

    await user.type(email(), "x");
    await afterFlush();

    expect(emailError()).not.toBeInTheDocument();
    expect(email()).not.toHaveAttribute("aria-invalid");
  });
});
