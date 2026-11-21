import { afterEach, describe, expect, it, vi } from "vitest";

import { clearCookies } from "../../test/clearCookies.ts";
import {
  loadUnderPolicy,
  scriptHashSource,
} from "../../test/contentSecurityPolicy.ts";
import { isJSDOM } from "../../test/isJSDOM.ts";
import { stubSystemPreference } from "../../test/color-scheme/stubSystemPreference.ts";
import * as cookie from "./cookie/index.ts";
import { colorSchemeScript } from "./local-storage/index.ts";

const root = document.documentElement;

/** Runs the script as the browser would run it from the document head. */
function runScript(source: string) {
  (0, eval)(source);
}

describe("colorSchemeScript", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    localStorage.clear();
    clearCookies();
    root.removeAttribute("data-color-scheme");
    root.removeAttribute("data-scheme");
    root.classList.remove("light", "dark");
  });

  it.each([
    [false, "light"],
    [true, "dark"],
  ])(
    "applies the system preference when nothing is saved (dark: %s)",
    (dark, expected) => {
      stubSystemPreference(dark);
      runScript(colorSchemeScript());
      expect(root).toHaveAttribute("data-color-scheme", expected);
    },
  );

  it.each(["light", "dark"])("applies a saved %s over the system", (scheme) => {
    stubSystemPreference(scheme === "light");
    localStorage.setItem("color-scheme", scheme);
    runScript(colorSchemeScript());
    expect(root).toHaveAttribute("data-color-scheme", scheme);
  });

  it("treats an unknown saved value as system", () => {
    stubSystemPreference(true);
    localStorage.setItem("color-scheme", "sepia");
    runScript(colorSchemeScript());
    expect(root).toHaveAttribute("data-color-scheme", "dark");
  });

  it("falls back to the system when storage throws", () => {
    stubSystemPreference(true);
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("SecurityError");
    });
    runScript(colorSchemeScript());
    expect(root).toHaveAttribute("data-color-scheme", "dark");
  });

  it("reads storageKey and writes attribute", () => {
    stubSystemPreference(false);
    localStorage.setItem("site-theme", "dark");
    runScript(
      colorSchemeScript({ storageKey: "site-theme", attribute: "data-scheme" }),
    );
    expect(root).toHaveAttribute("data-scheme", "dark");
    expect(root).not.toHaveAttribute("data-color-scheme");
  });

  it("swaps the light and dark classes with attribute class", () => {
    stubSystemPreference(false);
    root.classList.add("dark");
    runScript(colorSchemeScript({ attribute: "class" }));
    expect(root).toHaveClass("light");
    expect(root).not.toHaveClass("dark");
  });

  it("cannot close its script element through the options", () => {
    const source = colorSchemeScript({
      storageKey: "</script><script>alert(1)</script>",
    });
    expect(source).not.toContain("</script>");
    stubSystemPreference(false);
    localStorage.setItem("</script><script>alert(1)</script>", "dark");
    runScript(source);
    expect(root).toHaveAttribute("data-color-scheme", "dark");
  });

  // In Chromium only: jsdom does not enforce a Content Security Policy.
  describe("under a Content Security Policy", () => {
    // The look the system is not showing, so only the saved choice gives it.
    const saved = () =>
      matchMedia("(prefers-color-scheme: dark)").matches ? "light" : "dark";
    // Nothing is allowed but a script with the nonce.
    const noncePolicy = "default-src 'none'; script-src 'nonce-r4nd0m'";

    it.skipIf(isJSDOM)(
      "is blocked without the policy's nonce or hash",
      async () => {
        localStorage.setItem("color-scheme", saved());
        const html = await loadUnderPolicy(noncePolicy, {
          source: colorSchemeScript(),
        });
        expect(html).toEqual({});
      },
    );

    it.skipIf(isJSDOM)(
      "runs in a script element with the policy's nonce",
      async () => {
        localStorage.setItem("color-scheme", saved());
        const html = await loadUnderPolicy(noncePolicy, {
          source: colorSchemeScript(),
          nonce: "r4nd0m",
        });
        expect(html).toEqual({ "data-color-scheme": saved() });
      },
    );

    it.skipIf(isJSDOM)(
      "runs when the policy allows the hash of its source",
      async () => {
        localStorage.setItem("site-theme", saved());
        const source = colorSchemeScript({ storageKey: "site-theme" });
        const html = await loadUnderPolicy(
          `script-src ${await scriptHashSource(source)}`,
          { source },
        );
        expect(html).toEqual({ "data-color-scheme": saved() });
      },
    );

    it.skipIf(isJSDOM)("has another hash with other options", async () => {
      localStorage.setItem("site-theme", saved());
      const html = await loadUnderPolicy(
        `script-src ${await scriptHashSource(colorSchemeScript())}`,
        { source: colorSchemeScript({ storageKey: "site-theme" }) },
      );
      expect(html).toEqual({});
    });

    it.skipIf(isJSDOM)(
      "from menhir/color-scheme/cookie, runs with a nonce or a hash",
      async () => {
        document.cookie = `color-scheme=${saved()}`;
        const source = cookie.colorSchemeScript();
        const withNonce = await loadUnderPolicy(noncePolicy, {
          source,
          nonce: "r4nd0m",
        });
        expect(withNonce).toEqual({ "data-color-scheme": saved() });
        const withHash = await loadUnderPolicy(
          `script-src ${await scriptHashSource(source)}`,
          { source },
        );
        expect(withHash).toEqual({ "data-color-scheme": saved() });
      },
    );
  });

  describe("from menhir/color-scheme/cookie", () => {
    it.each(["light", "dark"])(
      "applies a saved %s over the system",
      (scheme) => {
        stubSystemPreference(scheme === "light");
        document.cookie = `session=abc`;
        document.cookie = `color-scheme=${scheme}`;
        runScript(cookie.colorSchemeScript());
        expect(root).toHaveAttribute("data-color-scheme", scheme);
      },
    );

    it.each([
      "",
      "color-scheme=sepia",
      "old-color-scheme=dark; color-scheme-v2=dark",
    ])("applies the system preference for the cookies %j", (cookies) => {
      stubSystemPreference(false);
      for (const pair of cookies.split("; ").filter(Boolean)) {
        document.cookie = pair;
      }
      runScript(cookie.colorSchemeScript());
      expect(root).toHaveAttribute("data-color-scheme", "light");
    });

    it("falls back to the system when cookies throw", () => {
      stubSystemPreference(true);
      vi.spyOn(Document.prototype, "cookie", "get").mockImplementation(() => {
        throw new Error("SecurityError");
      });
      runScript(cookie.colorSchemeScript());
      expect(root).toHaveAttribute("data-color-scheme", "dark");
    });

    it("reads the cookie named by storageKey, however it is spelled", () => {
      const storageKey = "</script><script>alert(1)</script>";
      const source = cookie.colorSchemeScript({ storageKey });
      expect(source).not.toContain("</script>");
      stubSystemPreference(false);
      document.cookie = `${encodeURIComponent(storageKey)}=dark`;
      runScript(source);
      expect(root).toHaveAttribute("data-color-scheme", "dark");
    });
  });
});
