import { describe, expect, test } from "vitest";

import { entryPointPage, isUtility } from "./utilities";

describe("utilities", () => {
  test("tells a utility's entry point from a component's", () => {
    expect(isUtility("menhir/color-scheme/local-storage")).toBe(true);
    expect(isUtility("menhir/color-scheme/cookie")).toBe(true);
    expect(isUtility("menhir/theme/local-storage")).toBe(true);
    expect(isUtility("menhir/switch")).toBe(false);
  });

  test("gives each entry point's docs page", () => {
    expect(entryPointPage("menhir/color-scheme/cookie")).toBe(
      "/docs/utilities/color-scheme",
    );
    expect(entryPointPage("menhir/switch")).toBe("/docs/components/switch");
  });
});
