import { describe, expect, it } from "vitest";

import { isJSDOM } from "#test-utils";

describe("isJSDOM", () => {
  // Layout is the plainest thing jsdom cannot do: every element measures
  // zero. So it is what isJSDOM is checked against.
  it("is true exactly when the environment does no layout", () => {
    const box = document.body.appendChild(document.createElement("div"));
    box.style.width = "100px";
    const laysOut = box.getBoundingClientRect().width === 100;
    box.remove();

    expect(isJSDOM).toBe(!laysOut);
  });
});
