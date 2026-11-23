import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { createRenderer, isJSDOM, renderOnServer, screen } from "#test-utils";

import { keyboard, nextTask } from "../floating/input.ts";
import { stubPopover } from "../popover/stubPopover.ts";
import MenubarFixture from "./MenubarFixture.tsx";

const fixture = "/test/menubar/MenubarFixture.tsx";
const item = (name: string) =>
  screen.getByRole("menuitem", { name, hidden: true });

describe("<Menubar.Root /> hydration", () => {
  const { render } = createRenderer();
  stubPopover();
  beforeAll(() => {
    Element.prototype.scrollIntoView ??= () => {};
  });
  afterEach(() => vi.restoreAllMocks());

  // The server render runs the modules: one that read `document` or
  // `window` there would fail it.
  it("renders the bar with its first item as the tab stop, and hidden Popups linked by ids, with no item active", async () => {
    const container = await renderOnServer(fixture);
    const bar = screen.getByTestId("bar");
    const edit = item("Edit");
    const editMenu = screen.getByTestId("edit");

    expect(bar).toHaveAttribute("role", "menubar");
    expect(bar).toHaveAttribute("aria-label", "Editor");
    expect(edit.tagName).toBe("BUTTON");
    expect(edit).toHaveAttribute("tabindex", "0");
    expect(item("View")).toHaveAttribute("tabindex", "-1");
    expect(edit).toHaveAttribute("aria-haspopup", "menu");
    expect(edit).toHaveAttribute("aria-expanded", "false");
    expect(edit).toHaveAttribute("popovertarget", editMenu.id);
    expect(editMenu).toHaveAttribute("role", "menu");
    expect(editMenu).toHaveAttribute("aria-labelledby", edit.id);
    expect(editMenu.matches(":popover-open")).toBe(false);
    expect(container.querySelector("[data-active]")).toBeNull();
    expect(screen.getByTestId("share")).toHaveAttribute(
      "aria-labelledby",
      item("Share").id,
    );
    container.remove();
  });

  it("renders a defaultOpen menu closed, with data-open", async () => {
    const container = await renderOnServer(fixture);
    const view = screen.getByTestId("view");

    expect(view.matches(":popover-open")).toBe(false);
    expect(view).toHaveAttribute("data-open", "");
    expect(item("View")).toHaveAttribute("data-open", "");
    container.remove();
  });

  it("adopts the server's elements without warnings, and opens a defaultOpen menu with focus on its first item", async () => {
    const container = await renderOnServer(fixture);
    const serverBar = screen.getByTestId("bar");
    const serverEdit = item("Edit");
    const serverView = screen.getByTestId("view");

    const warn = vi.spyOn(console, "warn");
    const error = vi.spyOn(console, "error");
    await render(() => <MenubarFixture />, { hydrate: container });
    await nextTask();

    expect(warn).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
    expect(screen.getByTestId("bar")).toBe(serverBar);
    expect(item("Edit")).toBe(serverEdit);
    expect(screen.getByTestId("view")).toBe(serverView);
    expect(serverView.matches(":popover-open")).toBe(true);
    await vi.waitFor(() =>
      expect(document.activeElement).toBe(item("Zoom in")),
    );
  });

  it("opens by a press and by Down Arrow after hydration", async () => {
    const container = await renderOnServer(fixture);
    const { user } = await render(() => <MenubarFixture />, {
      hydrate: container,
    });
    const edit = screen.getByTestId("edit");
    await nextTask();

    await user.click(item("Edit"));
    await nextTask();
    expect(edit.matches(":popover-open")).toBe(true);
    await vi.waitFor(() => expect(document.activeElement).toBe(item("Copy")));

    await user.click(item("Edit"));
    await nextTask();
    expect(edit.matches(":popover-open")).toBe(false);
    item("Edit").focus();

    await user.keyboard("{ArrowDown}");
    await nextTask();
    expect(edit.matches(":popover-open")).toBe(true);
    await vi.waitFor(() => expect(document.activeElement).toBe(item("Copy")));
  });

  it.skipIf(isJSDOM)(
    "moves along the bar after hydration, and closes on Escape with focus on the item",
    async () => {
      const container = await renderOnServer(fixture);
      await render(() => <MenubarFixture />, { hydrate: container });
      await nextTask();
      // The defaultOpen menu holds focus: close it first.
      await keyboard("{Escape}");
      await nextTask();
      expect(document.activeElement).toBe(item("View"));

      await keyboard("{ArrowLeft}{ArrowDown}");
      await nextTask();
      expect(screen.getByTestId("edit").matches(":popover-open")).toBe(true);
      expect(document.activeElement).toBe(item("Copy"));

      await keyboard("{Escape}");
      await nextTask();
      expect(document.activeElement).toBe(item("Edit"));
    },
  );
});
