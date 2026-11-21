import { describe, expect, it } from "vitest";

import { colorSchemeFromCookie } from "./cookie/index.ts";

describe("colorSchemeFromCookie", () => {
  it("reads the saved scheme from a Cookie header", () => {
    expect(colorSchemeFromCookie("session=abc; color-scheme=dark")).toBe(
      "dark",
    );
    expect(colorSchemeFromCookie("color-scheme=light")).toBe("light");
  });

  it.each([null, undefined, "", "session=abc", "color-scheme=sepia"])(
    "reads %j as system",
    (header) => {
      expect(colorSchemeFromCookie(header)).toBe("system");
    },
  );

  it("reads the cookie named by storageKey", () => {
    const header = "color-scheme=light; site-theme=dark";
    expect(colorSchemeFromCookie(header, { storageKey: "site-theme" })).toBe(
      "dark",
    );
  });
});
