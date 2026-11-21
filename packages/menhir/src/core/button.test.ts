import { afterEach, describe, expect, it, vi } from "vitest";

import { warnUnlessButton } from "./button.ts";

describe("warnUnlessButton", () => {
  afterEach(() => vi.restoreAllMocks());

  it("warns, naming the part and the element it got", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    warnUnlessButton(document.createElement("div"), "Switch.Root");

    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toBe(
      "[menhir] Switch.Root's render function rendered a <div>. " +
        "Render a <button>, which gives the part its keyboard support, focus and name.",
    );
  });

  it("is silent for a button", () => {
    const warn = vi.spyOn(console, "warn");

    warnUnlessButton(document.createElement("button"), "Switch.Root");

    expect(warn).not.toHaveBeenCalled();
  });
});
