import { afterEach, describe, expect, it, vi } from "vitest";

import { stubSystemPreference } from "../../test/color-mode/stubSystemPreference.ts";
import { colorModeScript } from "./colorModeScript.ts";

const root = document.documentElement;

/** Runs the script as the browser would run it from the document head. */
function runScript(source: string) {
  (0, eval)(source);
}

describe("colorModeScript", () => {
  afterEach(() => {
    localStorage.clear();
    root.removeAttribute("data-theme");
    root.removeAttribute("data-mode");
    root.classList.remove("light", "dark");
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it.each([
    [false, "light"],
    [true, "dark"],
  ])(
    "applies the system preference when nothing is saved (dark: %s)",
    (dark, expected) => {
      stubSystemPreference(dark);
      runScript(colorModeScript());
      expect(root).toHaveAttribute("data-theme", expected);
    },
  );

  it.each(["light", "dark"])("applies a saved %s over the system", (mode) => {
    stubSystemPreference(mode === "light");
    localStorage.setItem("color-mode", mode);
    runScript(colorModeScript());
    expect(root).toHaveAttribute("data-theme", mode);
  });

  it("treats an unknown saved value as system", () => {
    stubSystemPreference(true);
    localStorage.setItem("color-mode", "sepia");
    runScript(colorModeScript());
    expect(root).toHaveAttribute("data-theme", "dark");
  });

  it("falls back to the system when storage throws", () => {
    stubSystemPreference(true);
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("SecurityError");
    });
    runScript(colorModeScript());
    expect(root).toHaveAttribute("data-theme", "dark");
  });

  it("reads storageKey and writes attribute", () => {
    stubSystemPreference(false);
    localStorage.setItem("site-theme", "dark");
    runScript(
      colorModeScript({ storageKey: "site-theme", attribute: "data-mode" }),
    );
    expect(root).toHaveAttribute("data-mode", "dark");
    expect(root).not.toHaveAttribute("data-theme");
  });

  it("swaps the light and dark classes with attribute class", () => {
    stubSystemPreference(false);
    root.classList.add("dark");
    runScript(colorModeScript({ attribute: "class" }));
    expect(root).toHaveClass("light");
    expect(root).not.toHaveClass("dark");
  });

  it("cannot close its script element through the options", () => {
    const source = colorModeScript({
      storageKey: "</script><script>alert(1)</script>",
    });
    expect(source).not.toContain("</script>");
    stubSystemPreference(false);
    localStorage.setItem("</script><script>alert(1)</script>", "dark");
    runScript(source);
    expect(root).toHaveAttribute("data-theme", "dark");
  });
});
