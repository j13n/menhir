import { afterEach, describe, expect, it, vi } from "vitest";

import { createRenderer, renderOnServer, screen } from "#test-utils";

import { item, pressOn } from "./helpers.ts";
import ListNavigationFixture from "./ListNavigationFixture.tsx";

const fixture = "/test/floating/list-navigation/ListNavigationFixture.tsx";

describe("list navigation hydration", () => {
  const { render } = createRenderer();
  afterEach(() => vi.restoreAllMocks());

  // The server render runs the module: one that read `document` or
  // `window` there would fail it. Items register once mounted, which the
  // server never does, so none is active.
  it("renders no active item on the server", async () => {
    const container = await renderOnServer(fixture);

    expect(container.querySelectorAll("[role=menuitem]")).toHaveLength(4);
    expect(container.querySelectorAll("[role=option]")).toHaveLength(3);
    expect(container.querySelector("[data-active]")).toBeNull();
    expect(container.querySelector("[aria-activedescendant]")).toBeNull();
    for (const menuItem of container.querySelectorAll("[role=menuitem]"))
      expect(menuItem).toHaveAttribute("tabindex", "-1");
    expect(container.querySelector("#lemon")).not.toBeNull();
    // Nothing hydrates it, so cleanup would not remove it.
    container.remove();
  });

  it("adopts the server's elements, and the keys work afterwards in both forms", async () => {
    // jsdom has no scrolling: the keyboard's scroll into view is a no-op.
    Element.prototype.scrollIntoView ??= () => {};
    const container = await renderOnServer(fixture);
    const serverOption = container.querySelector("[role=option]");

    // A hydration mismatch is reported on the console, not thrown.
    const warn = vi.spyOn(console, "warn");
    const error = vi.spyOn(console, "error");
    await render(() => <ListNavigationFixture />, { hydrate: container });
    expect(warn).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
    expect(item("Kiwi")).toBe(serverOption);

    await pressOn(item("Apple"), "ArrowDown");
    await pressOn(item("Apple"), "ArrowDown");
    expect(item("Banana")).toHaveAttribute("data-active");
    expect(item("Banana")).toHaveAttribute("tabindex", "0");

    const input = screen.getByRole("combobox");
    await pressOn(input, "ArrowDown");
    await pressOn(input, "ArrowDown");
    expect(item("Lemon")).toHaveAttribute("data-active");
    expect(input).toHaveAttribute("aria-activedescendant", "lemon");
  });
});
