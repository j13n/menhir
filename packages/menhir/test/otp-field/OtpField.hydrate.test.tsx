import { afterEach, describe, expect, it, vi } from "vitest";

import {
  afterFlush,
  createRenderer,
  renderOnServer,
  screen,
} from "#test-utils";

import OtpFieldFixture from "./OtpFieldFixture.tsx";

const textbox = () =>
  screen.getByRole<HTMLInputElement>("textbox", { name: "Code" });
const code = () => screen.getByTestId("code").textContent;
const shown = () =>
  screen.getAllByTestId("slot").map((slot) => slot.textContent);

describe("<OtpField.Root /> hydration", () => {
  const { render } = createRenderer();
  afterEach(() => vi.restoreAllMocks());

  it("has the input with the code as its value attribute, its pattern and its label, and each box's character, in the server HTML", async () => {
    const container = await renderOnServer(
      "/test/otp-field/OtpFieldFixture.tsx",
    );

    expect(textbox()).toHaveAttribute("value", "12");
    expect(textbox()).toHaveValue("12");
    expect(textbox()).toHaveAttribute("name", "code");
    expect(textbox()).toHaveAttribute("pattern", "(?:[0-9]){6}");
    expect(textbox()).toHaveAttribute("autocomplete", "one-time-code");
    expect(textbox()).toHaveAttribute("inputmode", "numeric");
    expect(shown()).toEqual(["1", "2", "", "", "", ""]);
    // Nothing hydrates it, so cleanup would not remove it.
    container.remove();
  });

  it("adopts the server's elements; typing and a paste change the value and the form's data afterwards", async () => {
    const container = await renderOnServer(
      "/test/otp-field/OtpFieldFixture.tsx",
    );
    const serverInput = container.querySelector("input");

    // A hydration mismatch is reported on the console, not thrown.
    const warn = vi.spyOn(console, "warn");
    const error = vi.spyOn(console, "error");
    const { user } = await render(() => <OtpFieldFixture />, {
      hydrate: container,
    });
    expect(warn).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
    expect(textbox()).toBe(serverInput);

    textbox().focus();
    await user.keyboard("3");
    await afterFlush();
    expect(code()).toBe("123");
    expect(shown()).toEqual(["1", "2", "3", "", "", ""]);

    await user.paste("654 321");
    await afterFlush();

    expect(code()).toBe("654321");
    expect(shown()).toEqual(["6", "5", "4", "3", "2", "1"]);
    expect(new FormData(container.querySelector("form")!).get("code")).toBe(
      "654321",
    );
  });
});
