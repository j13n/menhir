// Flows across menus, with real input. The test list is in README.md.
import { afterEach, describe, expect, it, vi } from "vitest";

import { createRenderer, isJSDOM, screen } from "#test-utils";

import {
  centerOf,
  keyboard,
  line,
  movePointer,
  nextTask,
  press,
} from "../../test/floating/input.ts";
import { menuKinds } from "../../test/menu/kinds.tsx";

const item = (name: string) =>
  screen.getByRole("menuitem", { name, hidden: true });
/** The Popup that a Trigger or SubmenuTrigger names in `aria-controls`. */
const menuOf = (triggerElement: HTMLElement) =>
  document.getElementById(triggerElement.getAttribute("aria-controls")!)!;
const shown = (element: HTMLElement) => element.matches(":popover-open");
const active = () => document.activeElement;
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe.skipIf(isJSDOM).each(menuKinds)("$name across submenus", (kind) => {
  const { Share, trigger, menu, pressOpen, keyOpen } = kind;
  const { render } = createRenderer();
  afterEach(() => vi.restoreAllMocks());

  /** Opens the Root's menu with a press, the pointer then off it. */
  async function open() {
    await pressOpen();
    expect(shown(menu())).toBe(true);
  }

  it("opens a submenu after the pointer rests on its trigger for delay, and closes it when the pointer leaves to a sibling item", async () => {
    const onOpenChange = vi.fn();
    await render(() => <Share share={{ onOpenChange, delay: 50 }} />);
    await open();

    await movePointer([centerOf(item("Share"))]);
    await wait(20);
    expect(shown(menuOf(item("Share")))).toBe(false);
    await wait(60);
    expect(shown(menuOf(item("Share")))).toBe(true);
    expect(onOpenChange).toHaveBeenLastCalledWith(true, {
      reason: "trigger-hover",
      event: expect.any(PointerEvent),
    });
    // Focus stays on the trigger, which the pointer made active.
    expect(active()).toBe(item("Share"));

    await movePointer(
      line(centerOf(item("Share")), centerOf(item("Paste")), 4),
    );
    await nextTask();

    expect(shown(menuOf(item("Share")))).toBe(false);
    expect(onOpenChange).toHaveBeenLastCalledWith(false, {
      reason: "trigger-hover",
      event: expect.any(PointerEvent),
    });
  });

  it("keeps the submenu open while the pointer crosses the safe area diagonally, over a sibling item", async () => {
    await render(() => <Share share={{ delay: 0 }} />);
    await open();
    const share = item("Share").getBoundingClientRect();
    // From the middle of the trigger's bottom edge, down and right into the
    // submenu's second item: the line passes over Paste before it reaches
    // the submenu.
    const from = { x: share.left + share.width / 2, y: share.bottom - 2 };
    await movePointer([centerOf(item("Share")), from]);
    await wait(10);
    expect(shown(menuOf(item("Share")))).toBe(true);

    const path = line(from, centerOf(item("Messages")), 8);
    const paste = item("Paste").getBoundingClientRect();
    expect(path.some(({ x, y }) => x < paste.right && y > paste.top)).toBe(
      true,
    );
    await movePointer(path);
    await nextTask();

    expect(shown(menuOf(item("Share")))).toBe(true);
    expect(active()).toBe(item("Messages"));
  });

  it("opens and closes submenus two levels deep by keyboard", async () => {
    await render(() => <Share />);
    await keyOpen();

    await keyboard("{ArrowDown}{ArrowRight}");
    await nextTask();
    expect(active()).toBe(item("Email"));
    await keyboard("{End}{ArrowRight}");
    await nextTask();
    expect(active()).toBe(item("Print"));
    expect(shown(menuOf(item("More")))).toBe(true);

    await keyboard("{ArrowLeft}");
    await nextTask();
    expect(active()).toBe(item("More"));
    expect(shown(menuOf(item("More")))).toBe(false);
    await keyboard("{ArrowLeft}");
    await nextTask();
    expect(active()).toBe(item("Share"));
    expect(shown(menuOf(item("Share")))).toBe(false);
    expect(shown(menu())).toBe(true);
  });

  it("opens submenus two levels deep by pointer, and an item in the deepest closes every menu", async () => {
    const onPrint = vi.fn();
    await render(() => (
      <Share onPrint={onPrint} share={{ delay: 0 }} more={{ delay: 0 }} />
    ));
    await open();

    await movePointer([centerOf(item("Share"))]);
    await wait(10);
    await movePointer(
      line(centerOf(item("Share")), centerOf(item("Email")), 4),
    );
    await movePointer(line(centerOf(item("Email")), centerOf(item("More")), 4));
    await wait(10);
    expect(shown(menuOf(item("More")))).toBe(true);
    await movePointer(line(centerOf(item("More")), centerOf(item("Print")), 4));
    await press(centerOf(item("Print")));
    await nextTask();

    expect(onPrint).toHaveBeenCalledTimes(1);
    for (const element of [menu(), menuOf(item("Share")), menuOf(item("More"))])
      expect(shown(element)).toBe(false);
  });

  it("closes every menu on Tab from a submenu", async () => {
    await render(() => <Share />);
    await keyOpen();
    await keyboard("{ArrowDown}{ArrowRight}");
    await nextTask();
    expect(active()).toBe(item("Email"));

    await keyboard("{Tab}");
    await nextTask();

    expect(shown(menuOf(item("Share")))).toBe(false);
    expect(shown(menu())).toBe(false);
    expect(active()).toBe(screen.getByRole("button", { name: "After" }));
  });

  it("closes every menu on Shift+Tab from a submenu, with focus on the Trigger", async () => {
    await render(() => <Share />);
    await keyOpen();
    await keyboard("{ArrowDown}{ArrowRight}");
    await nextTask();
    expect(active()).toBe(item("Email"));

    await keyboard("{Shift>}{Tab}{/Shift}");
    await nextTask();

    expect(shown(menuOf(item("Share")))).toBe(false);
    expect(shown(menu())).toBe(false);
    expect(active()).toBe(trigger());
  });

  it("types in a submenu without moving the menu around it", async () => {
    await render(() => <Share />);
    await keyOpen();
    await keyboard("{ArrowDown}{ArrowRight}");
    await nextTask();

    await keyboard("m");

    expect(active()).toBe(item("Messages"));
    expect(item("Share")).toHaveAttribute("data-active", "");
  });
});
