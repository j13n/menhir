import { afterEach, describe, expect, it, vi } from "vitest";

import { clearCookies } from "../../test/clearCookies.ts";
import {
  loadUnderPolicy,
  scriptHashSource,
} from "../../test/contentSecurityPolicy.ts";
import { isJSDOM } from "../../test/isJSDOM.ts";
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
    root.removeAttribute("data-color-mode");
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
      expect(root).toHaveAttribute("data-color-mode", expected);
    },
  );

  it.each(["light", "dark"])("applies a saved %s over the system", (mode) => {
    stubSystemPreference(mode === "light");
    localStorage.setItem("color-mode", mode);
    runScript(colorModeScript());
    expect(root).toHaveAttribute("data-color-mode", mode);
  });

  it("treats an unknown saved value as system", () => {
    stubSystemPreference(true);
    localStorage.setItem("color-mode", "sepia");
    runScript(colorModeScript());
    expect(root).toHaveAttribute("data-color-mode", "dark");
  });

  it("falls back to the system when storage throws", () => {
    stubSystemPreference(true);
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("SecurityError");
    });
    runScript(colorModeScript());
    expect(root).toHaveAttribute("data-color-mode", "dark");
  });

  it("reads storageKey and writes attribute", () => {
    stubSystemPreference(false);
    localStorage.setItem("site-theme", "dark");
    runScript(
      colorModeScript({ storageKey: "site-theme", attribute: "data-mode" }),
    );
    expect(root).toHaveAttribute("data-mode", "dark");
    expect(root).not.toHaveAttribute("data-color-mode");
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
    expect(root).toHaveAttribute("data-color-mode", "dark");
  });

  // jsdom does not enforce a Content Security Policy.
  describe.skipIf(isJSDOM)("under a Content Security Policy", () => {
    it("is blocked by a policy that allows no inline script", async () => {
      localStorage.setItem("color-mode", "dark");
      const html = await loadUnderPolicy("script-src 'nonce-r4nd0m'", {
        source: colorModeScript(),
      });
      expect(html).toEqual({});
    });

    it("runs in a script element with the policy's nonce", async () => {
      localStorage.setItem("color-mode", "dark");
      const html = await loadUnderPolicy("script-src 'nonce-r4nd0m'", {
        source: colorModeScript(),
        nonce: "r4nd0m",
      });
      expect(html).toEqual({ "data-color-mode": "dark" });
    });

    it("runs when the policy allows the hash of its source", async () => {
      localStorage.setItem("site-theme", "dark");
      const source = colorModeScript({ storageKey: "site-theme" });
      const html = await loadUnderPolicy(
        `script-src ${await scriptHashSource(source)}`,
        { source },
      );
      expect(html).toEqual({ "data-color-mode": "dark" });
    });

    it("has another hash with other options", async () => {
      localStorage.setItem("site-theme", "dark");
      const html = await loadUnderPolicy(
        `script-src ${await scriptHashSource(colorModeScript())}`,
        { source: colorModeScript({ storageKey: "site-theme" }) },
      );
      expect(html).toEqual({});
    });

    it("from menhir/color-mode/cookie, runs with a nonce or a hash", async () => {
      document.cookie = "color-mode=dark";
      const source = cookie.colorModeScript();
      const withNonce = await loadUnderPolicy("script-src 'nonce-r4nd0m'", {
        source,
        nonce: "r4nd0m",
      });
      expect(withNonce).toEqual({ "data-color-mode": "dark" });
      const withHash = await loadUnderPolicy(
        `script-src ${await scriptHashSource(source)}`,
        { source },
      );
      expect(withHash).toEqual({ "data-color-mode": "dark" });
    });
  });

  describe("from menhir/color-mode/cookie", () => {
    it.each(["light", "dark"])("applies a saved %s over the system", (mode) => {
      stubSystemPreference(mode === "light");
      document.cookie = `session=abc`;
      document.cookie = `color-mode=${mode}`;
      runScript(cookie.colorModeScript());
      expect(root).toHaveAttribute("data-color-mode", mode);
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
      expect(root).toHaveAttribute("data-color-mode", "light");
    });

    it("falls back to the system when cookies throw", () => {
      stubSystemPreference(true);
      vi.spyOn(Document.prototype, "cookie", "get").mockImplementation(() => {
        throw new Error("SecurityError");
      });
      runScript(cookie.colorModeScript());
      expect(root).toHaveAttribute("data-color-mode", "dark");
    });

    it("reads the cookie named by storageKey, however it is spelled", () => {
      const storageKey = "</script><script>alert(1)</script>";
      const source = cookie.colorModeScript({ storageKey });
      expect(source).not.toContain("</script>");
      stubSystemPreference(false);
      document.cookie = `${encodeURIComponent(storageKey)}=dark`;
      runScript(source);
      expect(root).toHaveAttribute("data-color-mode", "dark");
    });
  });
});
