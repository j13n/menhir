import { flush } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createRenderer, renderOnServer } from "#test-utils";

import ColorModeFixture from "./ColorModeFixture.tsx";
import { stubSystemPreference } from "./stubSystemPreference.ts";

describe("createColorMode hydration", () => {
  const { render } = createRenderer();
  afterEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
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
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");

    await user.click(button);
    expect(button).toHaveAttribute("data-mode", "light");
  });
});
