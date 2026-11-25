import { render } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";

import NativeScroller from "./NativeScroller";

describe("the Scroll Area page's native scroller recipe", () => {
  test("is a named region that takes focus", () => {
    const { getByRole } = render(() => <NativeScroller />);
    const scroller = getByRole("region", { name: "Releases" });
    expect(scroller).toHaveAttribute("tabindex", "0");
    expect(scroller).toHaveTextContent("Release 2.24");
  });
});
