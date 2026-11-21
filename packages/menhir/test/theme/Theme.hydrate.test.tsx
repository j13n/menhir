import { flush } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createRenderer, renderOnServer } from "#test-utils";

import { clearCookies } from "../clearCookies.ts";
import ThemeCookieFixture from "./ThemeCookieFixture.tsx";
import ThemeFixture from "./ThemeFixture.tsx";

describe("createTheme hydration", () => {
  const { render } = createRenderer();
  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    clearCookies();
    document.documentElement.removeAttribute("data-theme");
  });

  it("hydrates the server's default theme, then reads the saved one", async () => {
    const container = await renderOnServer("/test/theme/ThemeFixture.tsx");
    const serverButton = container.querySelector("button")!;
    // The server cannot see the reader's storage.
    expect(serverButton).toHaveAttribute("data-theme-name", "paper");

    localStorage.setItem("theme", "nord");
    // A hydration mismatch is reported on the console, not thrown.
    const warn = vi.spyOn(console, "warn");
    const error = vi.spyOn(console, "error");
    const { user } = await render(() => <ThemeFixture />, {
      hydrate: container,
    });
    flush();
    expect(warn).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();

    const button = container.querySelector("button")!;
    expect(button).toBe(serverButton);
    expect(button).toHaveAttribute("data-theme-name", "nord");
    expect(document.documentElement).toHaveAttribute("data-theme", "nord");

    await user.click(button);
    expect(button).toHaveAttribute("data-theme-name", "dracula");
    expect(localStorage.getItem("theme")).toBe("dracula");
  });

  it("renders the cookie's theme on the server, and hydrates it", async () => {
    const container = await renderOnServer(
      "/test/theme/ThemeCookieFixture.tsx",
      { cookie: "session=abc; theme=nord" },
    );
    const serverButton = container.querySelector("button")!;
    expect(serverButton).toHaveAttribute("data-theme-name", "nord");

    document.cookie = "theme=nord";
    const warn = vi.spyOn(console, "warn");
    const error = vi.spyOn(console, "error");
    const { user } = await render(() => <ThemeCookieFixture />, {
      hydrate: container,
    });
    flush();
    expect(warn).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();

    const button = container.querySelector("button")!;
    expect(button).toBe(serverButton);
    expect(button).toHaveAttribute("data-theme-name", "nord");

    await user.click(button);
    expect(button).toHaveAttribute("data-theme-name", "dracula");
    expect(document.cookie).toBe("theme=dracula");
  });
});
