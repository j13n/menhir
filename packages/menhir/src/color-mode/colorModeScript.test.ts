import { afterEach, describe, expect, it, vi } from "vitest";

import { clearCookies } from "../../test/clearCookies.ts";
import { stubSystemPreference } from "../../test/color-mode/stubSystemPreference.ts";
import * as cookie from "./cookie/index.ts";
import { colorModeScript } from "./local-storage/index.ts";

const root = document.documentElement;

/** Runs the script as the browser would run it from the document head. */
function runScript(source: string) {
  (0, eval)(source);
}

describe("colorModeScript", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    localStorage.clear();
    clearCookies();
    root.removeAttribute("data-theme");
    root.removeAttribute("data-mode");
    root.classList.remove("light", "dark");
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

  describe("from menhir/color-mode/cookie", () => {
    it.each(["light", "dark"])("applies a saved %s over the system", (mode) => {
      stubSystemPreference(mode === "light");
      document.cookie = `session=abc`;
      document.cookie = `color-mode=${mode}`;
      runScript(cookie.colorModeScript());
      expect(root).toHaveAttribute("data-theme", mode);
    });

    it.each([
      "",
      "color-mode=sepia",
      "old-color-mode=dark; color-mode-v2=dark",
    ])("applies the system preference for the cookies %j", (cookies) => {
      stubSystemPreference(false);
      for (const pair of cookies.split("; ").filter(Boolean)) {
        document.cookie = pair;
      }
      runScript(cookie.colorModeScript());
      expect(root).toHaveAttribute("data-theme", "light");
    });

    it("falls back to the system when cookies throw", () => {
      stubSystemPreference(true);
      vi.spyOn(Document.prototype, "cookie", "get").mockImplementation(() => {
        throw new Error("SecurityError");
      });
      runScript(cookie.colorModeScript());
      expect(root).toHaveAttribute("data-theme", "dark");
    });

    it("reads the cookie named by storageKey, however it is spelled", () => {
      const storageKey = "</script><script>alert(1)</script>";
      const source = cookie.colorModeScript({ storageKey });
      expect(source).not.toContain("</script>");
      stubSystemPreference(false);
      document.cookie = `${encodeURIComponent(storageKey)}=dark`;
      runScript(source);
      expect(root).toHaveAttribute("data-theme", "dark");
    });
  });
});
