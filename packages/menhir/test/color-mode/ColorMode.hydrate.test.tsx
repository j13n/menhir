import { flush } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createRenderer, renderOnServer } from "#test-utils";

import { clearCookies } from "../clearCookies.ts";
import ColorModeCookieFixture from "./ColorModeCookieFixture.tsx";
import ColorModeFixture from "./ColorModeFixture.tsx";
import { stubSystemPreference } from "./stubSystemPreference.ts";

describe("createColorMode hydration", () => {
  const { render } = createRenderer();
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    localStorage.clear();
    clearCookies();
    document.documentElement.removeAttribute("data-color-mode");
  });

  it("hydrates the server's system state, then reads the saved choice", async () => {
    const container = await renderOnServer(
      "/test/color-mode/ColorModeFixture.tsx",
    );
    const serverButton = container.querySelector("button")!;
    // The server cannot see the reader's storage or system.
    expect(serverButton).toHaveAttribute("data-mode", "system");
    expect(serverButton).toHaveTextContent("light");

    stubSystemPreference(false);
    localStorage.setItem("color-mode", "dark");
    // A hydration mismatch is reported on the console, not thrown.
    const warn = vi.spyOn(console, "warn");
    const error = vi.spyOn(console, "error");
    const { user } = await render(() => <ColorModeFixture />, {
      hydrate: container,
    });
    flush();
    expect(warn).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();

    const button = container.querySelector("button")!;
    expect(button).toBe(serverButton);
    expect(button).toHaveAttribute("data-mode", "dark");
    expect(button).toHaveTextContent("dark");
    expect(document.documentElement).toHaveAttribute("data-color-mode", "dark");

    await user.click(button);
    expect(button).toHaveAttribute("data-mode", "light");
  });

  it("renders the cookie's choice on the server, and hydrates it", async () => {
    const container = await renderOnServer(
      "/test/color-mode/ColorModeCookieFixture.tsx",
      { cookie: "session=abc; color-mode=dark" },
    );
    const serverButton = container.querySelector("button")!;
    expect(serverButton).toHaveAttribute("data-mode", "dark");
    expect(serverButton).toHaveTextContent("dark");

    stubSystemPreference(false);
    document.cookie = "color-mode=dark";
    const warn = vi.spyOn(console, "warn");
    const error = vi.spyOn(console, "error");
    const { user } = await render(() => <ColorModeCookieFixture />, {
      hydrate: container,
    });
    flush();
    expect(warn).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();

    const button = container.querySelector("button")!;
    expect(button).toBe(serverButton);
    expect(button).toHaveAttribute("data-mode", "dark");

    await user.click(button);
    expect(button).toHaveAttribute("data-mode", "light");
    expect(document.cookie).toBe("color-mode=light");
  });
});
