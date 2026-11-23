// Flows between the bar and its menus. The test list is in README.md.
import { afterEach, describe, expect, it, vi } from "vitest";

import { afterFlush, createRenderer, isJSDOM, screen } from "#test-utils";

import { keyboard, nextTask } from "../../test/floating/input.ts";
import { stubMenu } from "../../test/menu/stubMenu.ts";
import { Editor } from "../../test/menubar/Editor.tsx";
import { Menubar } from "./index.ts";

const barItem = (name: string) => screen.getByRole("menuitem", { name });
const item = (name: string) =>
  screen.getByRole("menuitem", { name, hidden: true });
/** The Popup that an item names in `aria-controls`. */
const menuOf = (element: HTMLElement) =>
  document.getElementById(element.getAttribute("aria-controls")!)!;
const shown = (element: HTMLElement) =>
  menuOf(element).matches(":popover-open");
const active = () => document.activeElement;

describe("Menubar flows", () => {
  const { render } = createRenderer();
  stubMenu();
  afterEach(() => vi.restoreAllMocks());

  it("opens the next item's menu on Right Arrow in a menu, with focus on that item, wrapping from the last", async () => {
    const onEditChange = vi.fn();
    const onViewChange = vi.fn();
    const { user } = await render(() => (
      <Editor
        edit={{ onOpenChange: onEditChange }}
        view={{ onOpenChange: onViewChange }}
      />
    ));
    barItem("Edit").focus();
    await user.keyboard("{ArrowDown}");
    await vi.waitFor(() => expect(active()).toBe(item("Copy")));

    await user.keyboard("{ArrowRight}");
    await afterFlush();

    expect(shown(barItem("Edit"))).toBe(false);
    expect(shown(barItem("View"))).toBe(true);
    expect(active()).toBe(barItem("View"));
    expect(onEditChange).toHaveBeenLastCalledWith(false, {
      reason: "arrow-key",
      event: expect.any(KeyboardEvent),
    });
    expect(onViewChange).toHaveBeenLastCalledWith(true, {
      reason: "arrow-key",
      event: expect.any(KeyboardEvent),
    });

    await user.keyboard("{ArrowDown}");
    await vi.waitFor(() => expect(active()).toBe(item("Zoom in")));
    await user.keyboard("{ArrowRight}");
    await afterFlush();
    expect(shown(barItem("View"))).toBe(false);
    expect(shown(barItem("File"))).toBe(true);
    expect(active()).toBe(barItem("File"));
  });

  it("opens the previous item's menu on Left Arrow in a menu of the bar, with focus on that item", async () => {
    const { user } = await render(() => <Editor />);
    barItem("Edit").focus();
    await user.keyboard("{ArrowDown}");
    await vi.waitFor(() => expect(active()).toBe(item("Copy")));

    await user.keyboard("{ArrowLeft}");
    await afterFlush();

    expect(shown(barItem("Edit"))).toBe(false);
    expect(shown(barItem("File"))).toBe(true);
    expect(active()).toBe(barItem("File"));
  });

  it.skipIf(isJSDOM)(
    "closes every menu on Right Arrow in a submenu, on an item with no submenu, and opens the next item's",
    async () => {
      await render(() => <Editor />);
      barItem("Edit").focus();
      await keyboard("{ArrowDown}{ArrowDown}{ArrowDown}{ArrowRight}");
      await nextTask();
      expect(active()).toBe(item("Email"));

      await keyboard("{ArrowRight}");
      await nextTask();

      expect(shown(item("Share"))).toBe(false);
      expect(shown(barItem("Edit"))).toBe(false);
      expect(shown(barItem("View"))).toBe(true);
      expect(active()).toBe(barItem("View"));
    },
  );

  it.skipIf(isJSDOM)(
    "closes only the submenu on Left Arrow in it",
    async () => {
      await render(() => <Editor />);
      barItem("Edit").focus();
      await keyboard("{ArrowDown}{ArrowDown}{ArrowDown}{ArrowRight}");
      await nextTask();
      expect(active()).toBe(item("Email"));

      await keyboard("{ArrowLeft}");
      await nextTask();

      expect(shown(item("Share"))).toBe(false);
      expect(shown(barItem("Edit"))).toBe(true);
      expect(active()).toBe(item("Share"));
    },
  );

  it("opens a submenu on Right Arrow on its trigger, not the next menu", async () => {
    const { user } = await render(() => <Editor />);
    barItem("Edit").focus();
    await user.keyboard("{ArrowDown}");
    await vi.waitFor(() => expect(active()).toBe(item("Copy")));
    await user.keyboard("{ArrowDown}{ArrowDown}");
    expect(active()).toBe(item("Share"));

    await user.keyboard("{ArrowRight}");
    await afterFlush();

    expect(shown(item("Share"))).toBe(true);
    expect(shown(barItem("Edit"))).toBe(true);
    expect(shown(barItem("View"))).toBe(false);
  });

  it("does nothing on Right and Left Arrow in the menu of a bar of one menu", async () => {
    const { user } = await render(() => (
      <Editor>
        <Menubar.Menu>
          <Menubar.Trigger>Edit</Menubar.Trigger>
          <Menubar.Popup>
            <Menubar.Item>Copy</Menubar.Item>
          </Menubar.Popup>
        </Menubar.Menu>
      </Editor>
    ));
    barItem("Edit").focus();
    await user.keyboard("{ArrowDown}");
    await vi.waitFor(() => expect(active()).toBe(item("Copy")));

    await user.keyboard("{ArrowRight}{ArrowLeft}");
    await afterFlush();

    expect(shown(barItem("Edit"))).toBe(true);
    expect(active()).toBe(item("Copy"));
  });

  it.skipIf(isJSDOM)(
    "closes the menu when an item is activated, with focus back on its item in the bar",
    async () => {
      const onCopy = vi.fn();
      await render(() => <Editor onCopy={onCopy} />);
      barItem("Edit").focus();
      await keyboard("{ArrowDown}");
      await nextTask();

      await keyboard("{Enter}");
      await nextTask();

      expect(onCopy).toHaveBeenCalledTimes(1);
      expect(shown(barItem("Edit"))).toBe(false);
      expect(active()).toBe(barItem("Edit"));
    },
  );

  it.skipIf(isJSDOM)(
    "closes the menu on Tab, which leaves the bar",
    async () => {
      await render(() => <Editor />);
      barItem("Edit").focus();
      await keyboard("{ArrowDown}");
      await nextTask();

      await keyboard("{Tab}");
      await nextTask();

      expect(shown(barItem("Edit"))).toBe(false);
      expect(active()).toBe(screen.getByRole("button", { name: "After" }));
    },
  );

  it.skipIf(isJSDOM)(
    "closes every menu on Shift+Tab from a menu or a submenu, with focus on the element before the bar",
    async () => {
      const onOpenChange = vi.fn();
      await render(() => <Editor edit={{ onOpenChange }} />);
      const before = screen.getByRole("button", { name: "Before" });
      barItem("Edit").focus();
      await keyboard("{ArrowDown}");
      await nextTask();

      await keyboard("{Shift>}{Tab}{/Shift}");
      await nextTask();
      expect(shown(barItem("Edit"))).toBe(false);
      expect(active()).toBe(before);
      expect(onOpenChange).toHaveBeenLastCalledWith(false, {
        reason: "focus-out",
        event: expect.any(FocusEvent),
      });

      barItem("Edit").focus();
      await keyboard("{ArrowDown}{ArrowDown}{ArrowDown}{ArrowRight}");
      await nextTask();
      expect(active()).toBe(item("Email"));

      await keyboard("{Shift>}{Tab}{/Shift}");
      await nextTask();
      expect(shown(item("Share"))).toBe(false);
      expect(shown(barItem("Edit"))).toBe(false);
      expect(active()).toBe(before);
    },
  );
});
