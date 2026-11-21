import { flush, untrack } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createRenderer, fireEvent, screen } from "#test-utils";

import { clearCookies } from "../../test/clearCookies.ts";
import { stubSystemPreference } from "../../test/color-scheme/stubSystemPreference.ts";
import * as cookie from "./cookie/index.ts";
import * as local from "./local-storage/index.ts";
import { createColorScheme, nextColorScheme } from "./local-storage/index.ts";
import type {
  ColorSchemeOptions,
  ColorSchemeState,
} from "./local-storage/index.ts";

const root = document.documentElement;

describe("createColorScheme", () => {
  const { render } = createRenderer();

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    localStorage.clear();
    clearCookies();
    root.removeAttribute("data-color-scheme");
    root.removeAttribute("data-scheme");
    root.classList.remove("light", "dark");
  });

  /**
   * Renders one instance, from `menhir/color-scheme/local-storage` unless
   * another entry point's `createColorScheme` is given, and lets the page
   * settle.
   */
  async function setup(
    options?: ColorSchemeOptions,
    create: typeof createColorScheme = createColorScheme,
  ) {
    let state!: ColorSchemeState;
    const result = await render(() => {
      state = create(options);
      return (
        <output>
          {state.scheme()} {state.system()} {state.resolved()}
        </output>
      );
    });
    flush();
    return { ...result, state };
  }

  it("reads the saved choice and the system once settled", async () => {
    stubSystemPreference(true);
    localStorage.setItem("color-scheme", "light");
    const { state } = await setup();
    expect(state.scheme()).toBe("light");
    expect(state.system()).toBe("dark");
    expect(state.resolved()).toBe("light");
    expect(screen.getByRole("status")).toHaveTextContent("light dark light");
    expect(root).toHaveAttribute("data-color-scheme", "light");
  });

  it("is system with nothing saved, and resolves to the system's look", async () => {
    stubSystemPreference(true);
    const { state } = await setup();
    expect(state.scheme()).toBe("system");
    expect(state.resolved()).toBe("dark");
    expect(root).toHaveAttribute("data-color-scheme", "dark");
  });

  it("treats an unknown saved value as system", async () => {
    stubSystemPreference(false);
    localStorage.setItem("color-scheme", "sepia");
    const { state } = await setup();
    expect(state.scheme()).toBe("system");
  });

  it("applies the same look as the head script with the same options", async () => {
    for (const entry of [local, cookie]) {
      for (const options of [
        {},
        { attribute: "class" },
      ] satisfies ColorSchemeOptions[]) {
        for (const saved of [null, "light", "dark"]) {
          for (const dark of [false, true]) {
            stubSystemPreference(dark);
            if (saved && entry === cookie) {
              document.cookie = `color-scheme=${saved}`;
            } else if (saved) {
              localStorage.setItem("color-scheme", saved);
            }
            (0, eval)(entry.colorSchemeScript(options));
            const fromScript = [
              root.getAttribute("data-color-scheme"),
              root.className,
            ];
            root.removeAttribute("data-color-scheme");
            root.className = "";

            const { unmount } = await setup(options, entry.createColorScheme);
            expect([
              root.getAttribute("data-color-scheme"),
              root.className,
            ]).toEqual(fromScript);
            unmount();
            root.removeAttribute("data-color-scheme");
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
      const { state, unmount } = await setup(options, entry.createColorScheme);
      state.setScheme("dark");
      flush();
      unmount();
      root.removeAttribute("data-color-scheme");

      (0, eval)(entry.colorSchemeScript(options));
      expect(root).toHaveAttribute("data-color-scheme", "dark");
    },
  );

  it("saves a choice, applies it, and forgets it for system", async () => {
    stubSystemPreference(false);
    const { state } = await setup();

    state.setScheme("dark");
    flush();
    expect(state.scheme()).toBe("dark");
    expect(localStorage.getItem("color-scheme")).toBe("dark");
    expect(root).toHaveAttribute("data-color-scheme", "dark");

    state.setScheme("system");
    flush();
    expect(state.scheme()).toBe("system");
    expect(localStorage.getItem("color-scheme")).toBeNull();
    expect(root).toHaveAttribute("data-color-scheme", "light");
  });

  it("cycles from a button click with nextColorScheme", async () => {
    stubSystemPreference(false);
    const { user } = await render(() => {
      const colorScheme = createColorScheme();
      return (
        <button
          type="button"
          onClick={() =>
            colorScheme.setScheme(
              nextColorScheme(colorScheme.scheme(), colorScheme.system()),
            )
          }
        >
          {colorScheme.scheme()}
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
    expect(root).toHaveAttribute("data-color-scheme", "dark");
  });

  it("keeps a fixed choice when the system changes", async () => {
    const system = stubSystemPreference(false);
    localStorage.setItem("color-scheme", "light");
    const { state } = await setup();

    system.set(true);
    flush();
    expect(state.system()).toBe("dark");
    expect(state.resolved()).toBe("light");
    expect(root).toHaveAttribute("data-color-scheme", "light");
  });

  it("follows a choice made in another tab", async () => {
    stubSystemPreference(false);
    const { state } = await setup();

    localStorage.setItem("color-scheme", "dark");
    fireEvent(
      window,
      new StorageEvent("storage", { key: "color-scheme", newValue: "dark" }),
    );
    expect(state.scheme()).toBe("dark");
    expect(root).toHaveAttribute("data-color-scheme", "dark");

    // Another tab cleared the storage.
    fireEvent(window, new StorageEvent("storage", { key: null }));
    expect(state.scheme()).toBe("system");
  });

  it("ignores other storage keys", async () => {
    stubSystemPreference(false);
    const { state } = await setup();

    fireEvent(
      window,
      new StorageEvent("storage", { key: "other", newValue: "dark" }),
    );
    expect(state.scheme()).toBe("system");
  });

  it("keeps instances in the same tab in step", async () => {
    stubSystemPreference(false);
    let first!: ColorSchemeState;
    let second!: ColorSchemeState;
    let other!: ColorSchemeState;
    await render(() => {
      first = createColorScheme();
      second = createColorScheme();
      other = createColorScheme({
        storageKey: "other",
        attribute: "data-scheme",
      });
      return null;
    });
    flush();

    first.setScheme("dark");
    flush();
    expect(second.scheme()).toBe("dark");
    expect(other.scheme()).toBe("system");
  });

  it("uses storageKey and attribute", async () => {
    stubSystemPreference(false);
    localStorage.setItem("site-theme", "dark");
    const { state } = await setup({
      storageKey: "site-theme",
      attribute: "data-scheme",
    });
    expect(state.scheme()).toBe("dark");
    expect(root).toHaveAttribute("data-scheme", "dark");
    expect(root).not.toHaveAttribute("data-color-scheme");

    state.setScheme("light");
    flush();
    expect(localStorage.getItem("site-theme")).toBe("light");
    expect(localStorage.getItem("color-scheme")).toBeNull();
  });

  it("swaps the light and dark classes with attribute class", async () => {
    stubSystemPreference(true);
    const { state } = await setup({ attribute: "class" });
    expect(root).toHaveClass("dark");

    state.setScheme("light");
    flush();
    expect(root).toHaveClass("light");
    expect(root).not.toHaveClass("dark");
    expect(root).not.toHaveAttribute("data-color-scheme");
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

    state.setScheme("dark");
    flush();
    expect(state.scheme()).toBe("dark");
    expect(root).toHaveAttribute("data-color-scheme", "dark");
  });

  it("stops listening when its owner is disposed", async () => {
    const system = stubSystemPreference(false);
    const { state, unmount } = await setup();
    expect(system.listeners.size).toBe(1);

    unmount();
    expect(system.listeners.size).toBe(0);
    fireEvent(
      window,
      new StorageEvent("storage", { key: "color-scheme", newValue: "dark" }),
    );
    expect(state.scheme()).toBe("system");
  });

  describe("from menhir/color-scheme/cookie", () => {
    it("reads the saved choice on the first render", async () => {
      stubSystemPreference(false);
      document.cookie = "color-scheme=dark";
      let first: string | undefined;
      await render(() => {
        const colorScheme = cookie.createColorScheme();
        first = untrack(colorScheme.scheme);
        return null;
      });
      expect(first).toBe("dark");
    });

    it("applies the cookie, not localStorage, once settled", async () => {
      stubSystemPreference(false);
      document.cookie = "color-scheme=dark";
      localStorage.setItem("color-scheme", "light");
      const { state } = await setup({}, cookie.createColorScheme);
      expect(state.scheme()).toBe("dark");
      expect(root).toHaveAttribute("data-color-scheme", "dark");
    });

    it("saves a choice in a lasting cookie, and forgets it for system", async () => {
      stubSystemPreference(false);
      const { state } = await setup({}, cookie.createColorScheme);
      const written = vi.spyOn(Document.prototype, "cookie", "set");

      state.setScheme("dark");
      flush();
      expect(document.cookie).toBe("color-scheme=dark");
      expect(localStorage.getItem("color-scheme")).toBeNull();
      expect(root).toHaveAttribute("data-color-scheme", "dark");
      // Sent with every request to the site, and kept for a year.
      const setCookie = written.mock.lastCall![0];
      expect(setCookie).toContain("; Path=/");
      expect(setCookie).toContain("; Max-Age=31536000");
      expect(setCookie).toContain("; SameSite=Lax");

      state.setScheme("system");
      flush();
      expect(document.cookie).toBe("");
      expect(root).toHaveAttribute("data-color-scheme", "light");
    });

    it.each(["__Host-color-scheme", "__Secure-color-scheme"])(
      "saves a %s cookie as Secure, which its prefix requires",
      async (storageKey) => {
        stubSystemPreference(false);
        const { state } = await setup({ storageKey }, cookie.createColorScheme);
        const written = vi.spyOn(Document.prototype, "cookie", "set");

        state.setScheme("dark");
        flush();
        const setCookie = written.mock.lastCall?.[0];
        expect(setCookie).toMatch(new RegExp(`^${storageKey}=dark;`));
        expect(setCookie).toContain("; Secure");
        expect(setCookie).toContain("; Path=/");
      },
    );

    it("picks up a choice made in another tab when shown again", async () => {
      stubSystemPreference(false);
      const { state, unmount } = await setup({}, cookie.createColorScheme);

      // Another tab saved a choice while this one was in the background.
      document.cookie = "color-scheme=dark";
      fireEvent(document, new Event("visibilitychange"));
      expect(state.scheme()).toBe("dark");
      expect(root).toHaveAttribute("data-color-scheme", "dark");

      unmount();
      document.cookie = "color-scheme=light";
      fireEvent(document, new Event("visibilitychange"));
      expect(state.scheme()).toBe("dark");
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
        const { state } = await setup({}, cookie.createColorScheme);
        expect(state.scheme()).toBe("system");

        state.setScheme("dark");
        flush();
        expect(state.scheme()).toBe("dark");
        expect(root).toHaveAttribute("data-color-scheme", "dark");
      } finally {
        delete (document as { cookie?: string }).cookie;
      }
    });
  });
});
