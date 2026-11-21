import { afterEach, describe, expect, it, vi } from "vitest";

import { clearCookies } from "../../test/clearCookies.ts";
import {
  loadUnderPolicy,
  scriptHashSource,
} from "../../test/contentSecurityPolicy.ts";
import { isJSDOM } from "../../test/isJSDOM.ts";
import * as cookie from "./cookie/index.ts";
import { themeScript } from "./local-storage/index.ts";

const root = document.documentElement;
const themes = ["paper", "nord", "dracula"] as const;
const options = { themes, defaultTheme: "paper" } as const;

/** Runs the script as the browser would run it from the document head. */
function runScript(source: string) {
  (0, eval)(source);
}

describe("themeScript", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    clearCookies();
    root.removeAttribute("data-theme");
    root.removeAttribute("data-palette");
    root.classList.remove(...themes);
  });

  it("applies the default theme when nothing is saved", () => {
    runScript(themeScript(options));
    expect(root).toHaveAttribute("data-theme", "paper");
  });

  it("applies a saved theme", () => {
    localStorage.setItem("theme", "nord");
    runScript(themeScript(options));
    expect(root).toHaveAttribute("data-theme", "nord");
  });

  it.each(["", "sepia", "Nord", "toString", "constructor"])(
    "applies the default theme for the saved value %j",
    (saved) => {
      localStorage.setItem("theme", saved);
      runScript(themeScript(options));
      expect(root).toHaveAttribute("data-theme", "paper");
    },
  );

  it("applies the default theme when storage throws", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("SecurityError");
    });
    runScript(themeScript(options));
    expect(root).toHaveAttribute("data-theme", "paper");
  });

  it("reads storageKey and writes attribute", () => {
    localStorage.setItem("site-palette", "dracula");
    runScript(
      themeScript({
        ...options,
        storageKey: "site-palette",
        attribute: "data-palette",
      }),
    );
    expect(root).toHaveAttribute("data-palette", "dracula");
    expect(root).not.toHaveAttribute("data-theme");
  });

  it("swaps the theme classes with attribute class", () => {
    root.classList.add("paper", "dracula");
    localStorage.setItem("theme", "nord");
    runScript(themeScript({ ...options, attribute: "class" }));
    expect(root.classList.value).toBe("nord");
  });

  it.each(["high contrast", "", "sépia"])(
    "rejects a theme named %j",
    (name) => {
      expect(() =>
        themeScript({ themes: ["paper", name], defaultTheme: "paper" }),
      ).toThrow(`[menhir] The theme ${JSON.stringify(name)} needs a name`);
    },
  );

  it("rejects a defaultTheme that is not one of themes", () => {
    expect(() =>
      themeScript({
        themes: ["paper", "nord"],
        defaultTheme: "sepia" as "paper",
      }),
    ).toThrow('[menhir] The defaultTheme "sepia" is not one of themes.');
  });

  it("cannot close its script element through the options", () => {
    const storageKey = "</script><script>alert(1)</script>";
    const source = themeScript({ ...options, storageKey });
    expect(source).not.toContain("</script>");
    localStorage.setItem(storageKey, "nord");
    runScript(source);
    expect(root).toHaveAttribute("data-theme", "nord");
  });

  // jsdom does not enforce a Content Security Policy.
  describe.skipIf(isJSDOM)("under a Content Security Policy", () => {
    it("is blocked by a policy that allows no inline script", async () => {
      const html = await loadUnderPolicy("script-src 'nonce-r4nd0m'", {
        source: themeScript(options),
      });
      expect(html).toEqual({});
    });

    it("runs in a script element with the policy's nonce", async () => {
      localStorage.setItem("theme", "nord");
      const html = await loadUnderPolicy("script-src 'nonce-r4nd0m'", {
        source: themeScript(options),
        nonce: "r4nd0m",
      });
      expect(html).toEqual({ "data-theme": "nord" });
    });

    it("runs when the policy allows the hash of its source", async () => {
      localStorage.setItem("theme", "nord");
      const source = themeScript(options);
      const html = await loadUnderPolicy(
        `script-src ${await scriptHashSource(source)}`,
        { source },
      );
      expect(html).toEqual({ "data-theme": "nord" });
    });
  });

  describe("from menhir/theme/cookie", () => {
    it("applies a saved theme, or the default", () => {
      runScript(cookie.themeScript(options));
      expect(root).toHaveAttribute("data-theme", "paper");

      document.cookie = "session=abc";
      document.cookie = "theme=dracula";
      runScript(cookie.themeScript(options));
      expect(root).toHaveAttribute("data-theme", "dracula");
    });

    it("applies the default theme when cookies throw", () => {
      document.cookie = "theme=nord";
      vi.spyOn(Document.prototype, "cookie", "get").mockImplementation(() => {
        throw new Error("SecurityError");
      });
      runScript(cookie.themeScript(options));
      expect(root).toHaveAttribute("data-theme", "paper");
    });

    it("reads the cookie named by storageKey, however it is spelled", () => {
      const storageKey = "</script><script>alert(1)</script>";
      const source = cookie.themeScript({ ...options, storageKey });
      expect(source).not.toContain("</script>");
      document.cookie = `${encodeURIComponent(storageKey)}=nord`;
      runScript(source);
      expect(root).toHaveAttribute("data-theme", "nord");
    });
  });
});
