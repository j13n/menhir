import { flush, untrack } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createRenderer, fireEvent, screen } from "#test-utils";

import { clearCookies } from "../../test/clearCookies.ts";
import { stubSystemPreference } from "../../test/color-mode/stubSystemPreference.ts";
import * as cookie from "./cookie/index.ts";
import * as local from "./local-storage/index.ts";
import { createColorMode, nextColorMode } from "./local-storage/index.ts";
import type {
  ColorModeOptions,
  ColorModeState,
} from "./local-storage/index.ts";

const root = document.documentElement;

describe("createColorMode", () => {
  const { render } = createRenderer();

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    localStorage.clear();
    clearCookies();
    root.removeAttribute("data-theme");
    root.removeAttribute("data-mode");
    root.classList.remove("light", "dark");
  });

  /**
   * Renders one instance, from `menhir/color-mode/local-storage` unless
   * another entry point's `createColorMode` is given, and lets the page
   * settle.
   */
  async function setup(
    options?: ColorModeOptions,
    create: typeof createColorMode = createColorMode,
  ) {
    let state!: ColorModeState;
    const result = await render(() => {
      state = create(options);
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
    for (const entry of [local, cookie]) {
      for (const options of [
        {},
        { attribute: "class" },
      ] satisfies ColorModeOptions[]) {
        for (const saved of [null, "light", "dark"]) {
          for (const dark of [false, true]) {
            stubSystemPreference(dark);
            if (saved && entry === cookie) {
              document.cookie = `color-mode=${saved}`;
            } else if (saved) {
              localStorage.setItem("color-mode", saved);
            }
            (0, eval)(entry.colorModeScript(options));
            const fromScript = [
              root.getAttribute("data-theme"),
              root.className,
            ];
            root.removeAttribute("data-theme");
            root.className = "";

            const { unmount } = await setup(options, entry.createColorMode);
            expect([root.getAttribute("data-theme"), root.className]).toEqual(
              fromScript,
            );
            unmount();
            root.removeAttribute("data-theme");
            root.className = "";
            localStorage.clear();
            clearCookies();
          }
        }
      }
    }
  });

  it.each([
    ["local-storage", local],
    ["cookie", cookie],
  ] as const)(
    "saves where the head script reads, under any storageKey (%s)",
    async (_, entry) => {
      stubSystemPreference(false);
      const options = { storageKey: "site theme; </script>" };
      const { state, unmount } = await setup(options, entry.createColorMode);
      state.setMode("dark");
      flush();
      unmount();
      root.removeAttribute("data-theme");

      (0, eval)(entry.colorModeScript(options));
      expect(root).toHaveAttribute("data-theme", "dark");
    },
  );

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

  describe("from menhir/color-mode/cookie", () => {
    it("reads the saved choice on the first render", async () => {
      stubSystemPreference(false);
      document.cookie = "color-mode=dark";
      let first: string | undefined;
      await render(() => {
        const colorMode = cookie.createColorMode();
        first = untrack(colorMode.mode);
        return null;
      });
      expect(first).toBe("dark");
    });

    it("applies the cookie, not localStorage, once settled", async () => {
      stubSystemPreference(false);
      document.cookie = "color-mode=dark";
      localStorage.setItem("color-mode", "light");
      const { state } = await setup({}, cookie.createColorMode);
      expect(state.mode()).toBe("dark");
      expect(root).toHaveAttribute("data-theme", "dark");
    });

    it("saves a choice in a lasting cookie, and forgets it for system", async () => {
      stubSystemPreference(false);
      const { state } = await setup({}, cookie.createColorMode);
      const written = vi.spyOn(Document.prototype, "cookie", "set");

      state.setMode("dark");
      flush();
      expect(document.cookie).toBe("color-mode=dark");
      expect(localStorage.getItem("color-mode")).toBeNull();
      expect(root).toHaveAttribute("data-theme", "dark");
      // Sent with every request to the site, and kept for a year.
      const setCookie = written.mock.lastCall![0];
      expect(setCookie).toContain("; Path=/");
      expect(setCookie).toContain("; Max-Age=31536000");
      expect(setCookie).toContain("; SameSite=Lax");

      state.setMode("system");
      flush();
      expect(document.cookie).toBe("");
      expect(root).toHaveAttribute("data-theme", "light");
    });

    it.each(["__Host-color-mode", "__Secure-color-mode"])(
      "saves a %s cookie as Secure, which its prefix requires",
      async (storageKey) => {
        stubSystemPreference(false);
        const { state } = await setup({ storageKey }, cookie.createColorMode);
        const written = vi.spyOn(Document.prototype, "cookie", "set");

        state.setMode("dark");
        flush();
        const setCookie = written.mock.lastCall?.[0];
        expect(setCookie).toMatch(new RegExp(`^${storageKey}=dark;`));
        expect(setCookie).toContain("; Secure");
        expect(setCookie).toContain("; Path=/");
      },
    );

    it("picks up a choice made in another tab when shown again", async () => {
      stubSystemPreference(false);
      const { state, unmount } = await setup({}, cookie.createColorMode);

      // Another tab saved a choice while this one was in the background.
      document.cookie = "color-mode=dark";
      fireEvent(document, new Event("visibilitychange"));
      expect(state.mode()).toBe("dark");
      expect(root).toHaveAttribute("data-theme", "dark");

      unmount();
      document.cookie = "color-mode=light";
      fireEvent(document, new Event("visibilitychange"));
      expect(state.mode()).toBe("dark");
    });

    it("works without cookies, for the life of the page", async () => {
      stubSystemPreference(false);
      const error = () => {
        throw new Error("SecurityError");
      };
      // On the document itself, so that deleting it restores the original.
      Object.defineProperty(document, "cookie", {
        configurable: true,
        get: error,
        set: error,
      });
      try {
        const { state } = await setup({}, cookie.createColorMode);
        expect(state.mode()).toBe("system");

        state.setMode("dark");
        flush();
        expect(state.mode()).toBe("dark");
        expect(root).toHaveAttribute("data-theme", "dark");
      } finally {
        delete (document as { cookie?: string }).cookie;
      }
    });
  });
});
