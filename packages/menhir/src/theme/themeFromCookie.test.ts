import { describe, expect, it } from "vitest";

import { themeFromCookie } from "./cookie/index.ts";

const options = { themes: ["paper", "nord"], defaultTheme: "paper" } as const;

describe("themeFromCookie", () => {
  it("reads the saved theme from a Cookie header", () => {
    expect(themeFromCookie("session=abc; theme=nord", options)).toBe("nord");
  });

  it.each([
    null,
    undefined,
    "",
    "session=abc",
    "theme=sepia",
    "theme=constructor",
  ])("reads %j as the default theme", (header) => {
    expect(themeFromCookie(header, options)).toBe("paper");
  });

  it("reads the cookie named by storageKey", () => {
    const header = "theme=paper; site-palette=nord";
    expect(
      themeFromCookie(header, { ...options, storageKey: "site-palette" }),
    ).toBe("nord");
  });
});
