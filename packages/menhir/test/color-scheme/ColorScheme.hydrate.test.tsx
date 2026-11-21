import { flush } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createRenderer, renderOnServer } from "#test-utils";

import { clearCookies } from "../clearCookies.ts";
import ColorSchemeCookieFixture from "./ColorSchemeCookieFixture.tsx";
import ColorSchemeFixture from "./ColorSchemeFixture.tsx";
import { stubSystemPreference } from "./stubSystemPreference.ts";

describe("createColorScheme hydration", () => {
  const { render } = createRenderer();
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    localStorage.clear();
    clearCookies();
    document.documentElement.removeAttribute("data-color-scheme");
  });

  it("hydrates the server's system state, then reads the saved choice", async () => {
    const container = await renderOnServer(
      "/test/color-scheme/ColorSchemeFixture.tsx",
    );
    const serverButton = container.querySelector("button")!;
    // The server cannot see the reader's storage or system.
    expect(serverButton).toHaveAttribute("data-scheme", "system");
    expect(serverButton).toHaveTextContent("light");

    stubSystemPreference(false);
    localStorage.setItem("color-scheme", "dark");
    // A hydration mismatch is reported on the console, not thrown.
    const warn = vi.spyOn(console, "warn");
    const error = vi.spyOn(console, "error");
    const { user } = await render(() => <ColorSchemeFixture />, {
      hydrate: container,
    });
    flush();
    expect(warn).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();

    const button = container.querySelector("button")!;
    expect(button).toBe(serverButton);
    expect(button).toHaveAttribute("data-scheme", "dark");
    expect(button).toHaveTextContent("dark");
    expect(document.documentElement).toHaveAttribute(
      "data-color-scheme",
      "dark",
    );

    await user.click(button);
    expect(button).toHaveAttribute("data-scheme", "light");
  });

  it("renders the cookie's choice on the server, and hydrates it", async () => {
    const container = await renderOnServer(
      "/test/color-scheme/ColorSchemeCookieFixture.tsx",
      { cookie: "session=abc; color-scheme=dark" },
    );
    const serverButton = container.querySelector("button")!;
    expect(serverButton).toHaveAttribute("data-scheme", "dark");
    expect(serverButton).toHaveTextContent("dark");

    stubSystemPreference(false);
    document.cookie = "color-scheme=dark";
    const warn = vi.spyOn(console, "warn");
    const error = vi.spyOn(console, "error");
    const { user } = await render(() => <ColorSchemeCookieFixture />, {
      hydrate: container,
    });
    flush();
    expect(warn).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();

    const button = container.querySelector("button")!;
    expect(button).toBe(serverButton);
    expect(button).toHaveAttribute("data-scheme", "dark");

    await user.click(button);
    expect(button).toHaveAttribute("data-scheme", "light");
    expect(document.cookie).toBe("color-scheme=light");
  });
});
