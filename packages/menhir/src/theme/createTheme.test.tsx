import { For, flush, untrack } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createRenderer, fireEvent, screen } from "#test-utils";

import { clearCookies } from "../../test/clearCookies.ts";
import { stubSystemPreference } from "../../test/color-mode/stubSystemPreference.ts";
import { createColorMode } from "../color-mode/local-storage/index.ts";
import * as cookie from "./cookie/index.ts";
import * as local from "./local-storage/index.ts";
import { createTheme } from "./local-storage/index.ts";
import type { ThemeOptions, ThemeState } from "./local-storage/index.ts";

const root = document.documentElement;
const themes = ["paper", "nord", "dracula"] as const;
type Theme = (typeof themes)[number];
const options: ThemeOptions<Theme> = { themes, defaultTheme: "paper" };

describe("createTheme", () => {
  const { render } = createRenderer();

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    localStorage.clear();
    clearCookies();
    root.removeAttribute("data-theme");
    root.removeAttribute("data-palette");
    root.removeAttribute("data-mode");
    root.className = "";
  });

  /**
   * Renders one instance, from `menhir/theme/local-storage` unless another
   * entry point's `createTheme` is given, and lets the page settle.
   */
  async function setup(
    overrides: Partial<ThemeOptions<Theme>> = {},
    create: typeof createTheme = createTheme,
  ) {
    let state!: ThemeState<Theme>;
    const result = await render(() => {
      state = create({ ...options, ...overrides });
      return <output>{state.theme()}</output>;
    });
    flush();
    return { ...result, state };
  }

  it("reads the saved theme once settled, and applies it", async () => {
    localStorage.setItem("theme", "nord");
    const { state } = await setup();
    expect(state.theme()).toBe("nord");
    expect(screen.getByRole("status")).toHaveTextContent("nord");
    expect(root).toHaveAttribute("data-theme", "nord");
  });

  it("is the default theme with nothing saved, or an unknown value", async () => {
    for (const saved of [null, "sepia", "constructor"]) {
      if (saved) localStorage.setItem("theme", saved);
      const { state, unmount } = await setup();
      expect(state.theme()).toBe("paper");
      expect(root).toHaveAttribute("data-theme", "paper");
      unmount();
    }
  });

  it("applies the same theme as the head script with the same options", async () => {
    for (const entry of [local, cookie]) {
      for (const overrides of [{}, { attribute: "class" }] satisfies Partial<
        ThemeOptions<Theme>
      >[]) {
        for (const saved of [null, "nord", "sepia"]) {
          if (saved && entry === cookie) document.cookie = `theme=${saved}`;
          else if (saved) localStorage.setItem("theme", saved);
          (0, eval)(entry.themeScript({ ...options, ...overrides }));
          const fromScript = [root.getAttribute("data-theme"), root.className];
          root.removeAttribute("data-theme");
          root.className = "";

          const { unmount } = await setup(overrides, entry.createTheme);
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
  });

  it.each([
    ["local-storage", local],
    ["cookie", cookie],
  ] as const)(
    "saves where the head script reads, under any storageKey (%s)",
    async (_, entry) => {
      const storageKey = "site theme; </script>";
      const { state, unmount } = await setup({ storageKey }, entry.createTheme);
      state.setTheme("dracula");
      flush();
      unmount();
      root.removeAttribute("data-theme");

      (0, eval)(entry.themeScript({ ...options, storageKey }));
      expect(root).toHaveAttribute("data-theme", "dracula");
    },
  );

  it("saves a theme, applies it, and forgets it for the default", async () => {
    const { state } = await setup();

    state.setTheme("nord");
    flush();
    expect(state.theme()).toBe("nord");
    expect(localStorage.getItem("theme")).toBe("nord");
    expect(root).toHaveAttribute("data-theme", "nord");

    state.setTheme("paper");
    flush();
    expect(state.theme()).toBe("paper");
    expect(localStorage.getItem("theme")).toBeNull();
    expect(root).toHaveAttribute("data-theme", "paper");
  });

  it("changes from a select", async () => {
    const { user } = await render(() => {
      const theme = createTheme(options);
      return (
        <label>
          Theme
          <select
            value={theme.theme()}
            onChange={(event) =>
              theme.setTheme(event.currentTarget.value as Theme)
            }
          >
            <For each={themes}>
              {(name) => <option value={name}>{name}</option>}
            </For>
          </select>
        </label>
      );
    });
    flush();

    await user.selectOptions(screen.getByLabelText("Theme"), "dracula");
    expect(root).toHaveAttribute("data-theme", "dracula");
    expect(localStorage.getItem("theme")).toBe("dracula");
  });

  it("follows a theme chosen in another tab, and storage cleared", async () => {
    const { state } = await setup();

    fireEvent(
      window,
      new StorageEvent("storage", { key: "theme", newValue: "nord" }),
    );
    expect(state.theme()).toBe("nord");
    expect(root).toHaveAttribute("data-theme", "nord");

    fireEvent(
      window,
      new StorageEvent("storage", { key: "other", newValue: "dracula" }),
    );
    expect(state.theme()).toBe("nord");

    fireEvent(window, new StorageEvent("storage", { key: null }));
    expect(state.theme()).toBe("paper");
  });

  it("keeps instances in the same tab in step, apart from a color mode", async () => {
    let first!: ThemeState<Theme>;
    let second!: ThemeState<Theme>;
    let colorMode!: ReturnType<typeof createColorMode>;
    stubSystemPreference(false);
    await render(() => {
      first = createTheme(options);
      second = createTheme(options);
      colorMode = createColorMode({ attribute: "data-mode" });
      return null;
    });
    flush();

    first.setTheme("dracula");
    flush();
    expect(second.theme()).toBe("dracula");
    expect(colorMode.mode()).toBe("system");
  });

  it("uses storageKey and attribute, and swaps classes with class", async () => {
    localStorage.setItem("site-palette", "nord");
    const { state } = await setup({
      storageKey: "site-palette",
      attribute: "data-palette",
    });
    expect(state.theme()).toBe("nord");
    expect(root).toHaveAttribute("data-palette", "nord");
    expect(root).not.toHaveAttribute("data-theme");

    const classes = await setup({ attribute: "class" });
    classes.state.setTheme("dracula");
    flush();
    expect(root.classList.value).toBe("dracula");
  });

  it("rejects a theme the head script could not apply", async () => {
    await expect(
      render(() => {
        createTheme({
          themes: ["paper", "high contrast"],
          defaultTheme: "paper",
        });
        return null;
      }),
    ).rejects.toThrow('[menhir] The theme "high contrast" needs a name');
  });

  it("works without storage, for the life of the page", async () => {
    const error = () => {
      throw new Error("SecurityError");
    };
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(error);
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(error);
    const { state } = await setup();

    state.setTheme("nord");
    flush();
    expect(state.theme()).toBe("nord");
    expect(root).toHaveAttribute("data-theme", "nord");
  });

  it("stops listening when its owner is disposed", async () => {
    const { state, unmount } = await setup();
    unmount();
    fireEvent(
      window,
      new StorageEvent("storage", { key: "theme", newValue: "nord" }),
    );
    expect(state.theme()).toBe("paper");
  });

  describe("from menhir/theme/cookie", () => {
    it("reads the saved theme on the first render", async () => {
      document.cookie = "theme=nord";
      let first: string | undefined;
      await render(() => {
        const theme = cookie.createTheme(options);
        first = untrack(theme.theme);
        return null;
      });
      expect(first).toBe("nord");
    });

    it("saves a theme in a lasting cookie, and forgets it for the default", async () => {
      const { state } = await setup({}, cookie.createTheme);
      const written = vi.spyOn(Document.prototype, "cookie", "set");

      state.setTheme("nord");
      flush();
      expect(document.cookie).toBe("theme=nord");
      expect(localStorage.getItem("theme")).toBeNull();
      const setCookie = written.mock.lastCall![0];
      expect(setCookie).toContain("; Path=/");
      expect(setCookie).toContain("; Max-Age=31536000");
      expect(setCookie).toContain("; SameSite=Lax");

      state.setTheme("paper");
      flush();
      expect(document.cookie).toBe("");
      expect(root).toHaveAttribute("data-theme", "paper");
    });

    it("picks up a theme chosen in another tab when shown again", async () => {
      const { state, unmount } = await setup({}, cookie.createTheme);

      document.cookie = "theme=dracula";
      fireEvent(document, new Event("visibilitychange"));
      expect(state.theme()).toBe("dracula");
      expect(root).toHaveAttribute("data-theme", "dracula");

      unmount();
      document.cookie = "theme=nord";
      fireEvent(document, new Event("visibilitychange"));
      expect(state.theme()).toBe("dracula");
    });
  });
});
