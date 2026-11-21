import { flush } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createRenderer, fireEvent, screen } from "#test-utils";

import { stubSystemPreference } from "../../test/color-mode/stubSystemPreference.ts";
import { nextColorMode } from "./colorMode.ts";
import type { ColorModeOptions } from "./colorMode.ts";
import { colorModeScript } from "./colorModeScript.ts";
import { createColorMode } from "./createColorMode.ts";
import type { ColorModeState } from "./createColorMode.ts";

const root = document.documentElement;

describe("createColorMode", () => {
  const { render } = createRenderer();

  afterEach(() => {
    localStorage.clear();
    root.removeAttribute("data-theme");
    root.removeAttribute("data-mode");
    root.classList.remove("light", "dark");
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  /** Renders one instance and lets the page settle. */
  async function setup(options?: ColorModeOptions) {
    let state!: ColorModeState;
    const result = await render(() => {
      state = createColorMode(options);
      return (
        <output>
          {state.mode()} {state.system()} {state.resolved()}
        </output>
      );
    });
    flush();
    return { ...result, state };
  }

  it("reads the saved choice and the system once settled", async () => {
    stubSystemPreference(true);
    localStorage.setItem("color-mode", "light");
    const { state } = await setup();
    expect(state.mode()).toBe("light");
    expect(state.system()).toBe("dark");
    expect(state.resolved()).toBe("light");
    expect(screen.getByRole("status")).toHaveTextContent("light dark light");
    expect(root).toHaveAttribute("data-theme", "light");
  });

  it("is system with nothing saved, and resolves to the system's look", async () => {
    stubSystemPreference(true);
    const { state } = await setup();
    expect(state.mode()).toBe("system");
    expect(state.resolved()).toBe("dark");
    expect(root).toHaveAttribute("data-theme", "dark");
  });

  it("treats an unknown saved value as system", async () => {
    stubSystemPreference(false);
    localStorage.setItem("color-mode", "sepia");
    const { state } = await setup();
    expect(state.mode()).toBe("system");
  });

  it("applies the same look as the head script with the same options", async () => {
    for (const options of [{}, { attribute: "class" as const }]) {
      for (const saved of [null, "light", "dark"]) {
        for (const dark of [false, true]) {
          stubSystemPreference(dark);
          if (saved) localStorage.setItem("color-mode", saved);
          (0, eval)(colorModeScript(options));
          const fromScript = [root.getAttribute("data-theme"), root.className];
          root.removeAttribute("data-theme");
          root.className = "";

          const { unmount } = await setup(options);
          expect([root.getAttribute("data-theme"), root.className]).toEqual(
            fromScript,
          );
          unmount();
          root.removeAttribute("data-theme");
          root.className = "";
          localStorage.clear();
        }
      }
    }
  });

  it("saves a choice, applies it, and forgets it for system", async () => {
    stubSystemPreference(false);
    const { state } = await setup();

    state.setMode("dark");
    flush();
    expect(state.mode()).toBe("dark");
    expect(localStorage.getItem("color-mode")).toBe("dark");
    expect(root).toHaveAttribute("data-theme", "dark");

    state.setMode("system");
    flush();
    expect(state.mode()).toBe("system");
    expect(localStorage.getItem("color-mode")).toBeNull();
    expect(root).toHaveAttribute("data-theme", "light");
  });

  it("cycles from a button click with nextColorMode", async () => {
    stubSystemPreference(false);
    const { user } = await render(() => {
      const colorMode = createColorMode();
      return (
        <button
          type="button"
          onClick={() =>
            colorMode.setMode(
              nextColorMode(colorMode.mode(), colorMode.system()),
            )
          }
        >
          {colorMode.mode()}
        </button>
      );
    });
    flush();
    const button = screen.getByRole("button");

    const seen = [button.textContent];
    for (let i = 0; i < 3; i++) {
      await user.click(button);
      seen.push(button.textContent);
    }
    expect(seen).toEqual(["system", "dark", "light", "system"]);
  });

  it("follows the system while the choice is system", async () => {
    const system = stubSystemPreference(false);
    const { state } = await setup();

    system.set(true);
    flush();
    expect(state.system()).toBe("dark");
    expect(state.resolved()).toBe("dark");
    expect(root).toHaveAttribute("data-theme", "dark");
  });

  it("keeps a fixed choice when the system changes", async () => {
    const system = stubSystemPreference(false);
    localStorage.setItem("color-mode", "light");
    const { state } = await setup();

    system.set(true);
    flush();
    expect(state.system()).toBe("dark");
    expect(state.resolved()).toBe("light");
    expect(root).toHaveAttribute("data-theme", "light");
  });

  it("follows a choice made in another tab", async () => {
    stubSystemPreference(false);
    const { state } = await setup();

    localStorage.setItem("color-mode", "dark");
    fireEvent(
      window,
      new StorageEvent("storage", { key: "color-mode", newValue: "dark" }),
    );
    expect(state.mode()).toBe("dark");
    expect(root).toHaveAttribute("data-theme", "dark");

    // Another tab cleared the storage.
    fireEvent(window, new StorageEvent("storage", { key: null }));
    expect(state.mode()).toBe("system");
  });

  it("ignores other storage keys", async () => {
    stubSystemPreference(false);
    const { state } = await setup();

    fireEvent(
      window,
      new StorageEvent("storage", { key: "other", newValue: "dark" }),
    );
    expect(state.mode()).toBe("system");
  });

  it("keeps instances in the same tab in step", async () => {
    stubSystemPreference(false);
    let first!: ColorModeState;
    let second!: ColorModeState;
    let other!: ColorModeState;
    await render(() => {
      first = createColorMode();
      second = createColorMode();
      other = createColorMode({ storageKey: "other", attribute: "data-mode" });
      return null;
    });
    flush();

    first.setMode("dark");
    flush();
    expect(second.mode()).toBe("dark");
    expect(other.mode()).toBe("system");
  });

  it("uses storageKey and attribute", async () => {
    stubSystemPreference(false);
    localStorage.setItem("site-theme", "dark");
    const { state } = await setup({
      storageKey: "site-theme",
      attribute: "data-mode",
    });
    expect(state.mode()).toBe("dark");
    expect(root).toHaveAttribute("data-mode", "dark");
    expect(root).not.toHaveAttribute("data-theme");

    state.setMode("light");
    flush();
    expect(localStorage.getItem("site-theme")).toBe("light");
    expect(localStorage.getItem("color-mode")).toBeNull();
  });

  it("swaps the light and dark classes with attribute class", async () => {
    stubSystemPreference(true);
    const { state } = await setup({ attribute: "class" });
    expect(root).toHaveClass("dark");

    state.setMode("light");
    flush();
    expect(root).toHaveClass("light");
    expect(root).not.toHaveClass("dark");
    expect(root).not.toHaveAttribute("data-theme");
  });

  it("works without storage, for the life of the page", async () => {
    stubSystemPreference(false);
    const error = () => {
      throw new Error("SecurityError");
    };
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(error);
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(error);
    vi.spyOn(Storage.prototype, "removeItem").mockImplementation(error);
    const { state } = await setup();

    state.setMode("dark");
    flush();
    expect(state.mode()).toBe("dark");
    expect(root).toHaveAttribute("data-theme", "dark");
  });

  it("stops listening when its owner is disposed", async () => {
    const system = stubSystemPreference(false);
    const { state, unmount } = await setup();
    expect(system.listeners.size).toBe(1);

    unmount();
    expect(system.listeners.size).toBe(0);
    fireEvent(
      window,
      new StorageEvent("storage", { key: "color-mode", newValue: "dark" }),
    );
    expect(state.mode()).toBe("system");
  });
});
