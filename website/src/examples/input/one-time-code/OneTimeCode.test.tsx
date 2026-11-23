import { render } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";

import OneTimeCode from "./OneTimeCode";

describe("the Input page's One-time code recipe", () => {
  test("is one input the platform fills from a message, with a number pad and six digits", () => {
    const { getByRole, unmount } = render(() => <OneTimeCode />);
    const control = getByRole<HTMLInputElement>("textbox", { name: "Code" });

    expect(control).toHaveAttribute("autocomplete", "one-time-code");
    expect(control).toHaveAttribute("inputmode", "numeric");
    expect(control.maxLength).toBe(6);
    control.value = "12345";
    expect(control.validity.patternMismatch).toBe(true);
    control.value = "123456";
    expect(control.checkValidity()).toBe(true);
    unmount();
  });
});
