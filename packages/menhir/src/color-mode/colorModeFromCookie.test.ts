import { describe, expect, it } from "vitest";

import { colorModeFromCookie } from "./cookie/index.ts";

describe("colorModeFromCookie", () => {
  it("reads the saved mode from a Cookie header", () => {
    expect(colorModeFromCookie("session=abc; color-mode=dark")).toBe("dark");
    expect(colorModeFromCookie("color-mode=light")).toBe("light");
  });

  it.each([null, undefined, "", "session=abc", "color-mode=sepia"])(
    "reads %j as system",
    (header) => {
      expect(colorModeFromCookie(header)).toBe("system");
    },
  );

  it("reads the cookie named by storageKey", () => {
    const header = "color-mode=light; site-theme=dark";
    expect(colorModeFromCookie(header, { storageKey: "site-theme" })).toBe(
      "dark",
    );
  });
});
