// The test list and the cases left out are in ../README.md.
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  afterFlush,
  createRenderer,
  describeConformance,
  isJSDOM,
  screen,
} from "#test-utils";

import {
  centerOf,
  keyboard,
  nextTask,
  press,
} from "../../../test/floating/input.ts";
import { menuKinds } from "../../../test/menu/kinds.tsx";
import { stubMenu } from "../../../test/menu/stubMenu.ts";
import { Menu } from "../index.ts";

const item = (name: string) =>
  screen.getByRole("menuitem", { name, hidden: true });
/** The Popup that a Trigger or SubmenuTrigger names in `aria-controls`. */
const menuOf = (triggerElement: HTMLElement) =>
  document.getElementById(triggerElement.getAttribute("aria-controls")!)!;
const shown = (element: HTMLElement) => element.matches(":popover-open");
const active = () => document.activeElement;

/** Waits for the frames in which observers report and placements land. */
async function frames(count = 3) {
  for (let i = 0; i < count; i++)
    await new Promise((resolve) => requestAnimationFrame(resolve));
}

describeConformance(
  "<Menu.SubmenuTrigger />",
  (props) => (
    <Menu.Root>
      <Menu.Popup>
        <Menu.Submenu>
          <Menu.SubmenuTrigger {...props} />
        </Menu.Submenu>
      </Menu.Popup>
    </Menu.Root>
  ),
  { tagName: "DIV" },
);

describe.each(menuKinds)("<Menu.Submenu /> in a $name", (kind) => {
  const { Share, trigger, menu, keyOpen } = kind;

  /** Opens the Root's menu by keyboard and moves to "Share". */
  async function openToShare() {
    await keyOpen();
    await keyboard("{ArrowDown}");
    expect(active()).toBe(item("Share"));
  }

  const { render } = createRenderer();
  stubMenu();
  afterEach(() => vi.restoreAllMocks());

  it("has a trigger that is a menuitem of the parent menu, with aria-haspopup, aria-expanded and aria-controls, labelling its Popup", async () => {
    await render(() => <Share defaultOpen />);
    const share = item("Share");
    const submenu = menuOf(share);

    expect(share.tagName).toBe("DIV");
    expect(share).toHaveAttribute("aria-haspopup", "menu");
    expect(share).toHaveAttribute("aria-expanded", "false");
    expect(share).toHaveAttribute("data-closed", "");
    expect(submenu).toHaveAttribute("role", "menu");
    expect(submenu).toHaveAttribute("popover", "auto");
    expect(submenu).toHaveAttribute("aria-labelledby", share.id);
    // The submenu is the sibling right after its trigger (menu pattern).
    expect(share.nextElementSibling).toBe(submenu);
  });

  it.skipIf(isJSDOM)(
    "keeps its trigger named by its own text while the submenu is open, in Chromium's accessibility tree",
    async () => {
      await render(() => <Share />);
      await openToShare();
      await keyboard("{ArrowRight}");
      await nextTask();
      expect(shown(menuOf(item("Share")))).toBe(true);

      // The tree a screen reader reads, not the DOM's computed name.
      // The tests run in a frame of the runner's page: ask for its tree.
      const { cdp } = await import("vitest/browser");
      type Frame = {
        frame: { id: string; url: string };
        childFrames?: Frame[];
      };
      const { frameTree } = (await cdp().send("Page.getFrameTree")) as {
        frameTree: Frame;
      };
      const frames = (frame: Frame): Frame[] => [
        frame,
        ...(frame.childFrames ?? []).flatMap(frames),
      ];
      const frameId = frames(frameTree).find(
        ({ frame }) => frame.url === location.href,
      )?.frame.id;
      expect(frameId).toBeDefined();
      const { nodes } = (await cdp().send("Accessibility.getFullAXTree", {
        frameId,
      })) as {
        nodes: {
          role?: { value: string };
          name?: { value: string };
          properties?: { name: string; value: { value: unknown } }[];
        }[];
      };
      const menuItems = nodes.filter((node) => node.role?.value === "menuitem");
      const share = menuItems.find((node) => node.name?.value === "Share");
      expect(share).toBeDefined();
      expect(
        share!.properties?.find((property) => property.name === "expanded")
          ?.value.value,
      ).toBe(true);
      // No item's name takes in the submenu's items.
      expect(
        menuItems.filter((node) => node.name?.value.includes("Email")),
      ).toHaveLength(1);
    },
  );

  it.skipIf(isJSDOM)(
    "opens on Right Arrow, Enter and Space with focus on its first item",
    async () => {
      const onOpenChange = vi.fn();
      await render(() => <Share share={{ onOpenChange }} />);
      const submenu = () => menuOf(item("Share"));

      for (const [key, reason] of [
        ["{ArrowRight}", "arrow-key"],
        ["{Enter}", "trigger-press"],
        [" ", "trigger-press"],
      ] as const) {
        await openToShare();
        await keyboard(key);
        await nextTask();
        expect(shown(submenu())).toBe(true);
        expect(item("Share")).toHaveAttribute("aria-expanded", "true");
        expect(active()).toBe(item("Email"));
        expect(onOpenChange).toHaveBeenLastCalledWith(true, {
          reason,
          event: expect.any(KeyboardEvent),
        });
        await keyboard("{Escape}{Escape}");
        await nextTask();
      }
    },
  );

  it.skipIf(isJSDOM)(
    "closes on Left Arrow, reporting arrow-key, and focuses its trigger",
    async () => {
      const onOpenChange = vi.fn();
      await render(() => <Share share={{ onOpenChange }} />);
      await openToShare();
      await keyboard("{ArrowRight}");
      await nextTask();

      await keyboard("{ArrowLeft}");
      await nextTask();

      expect(shown(menuOf(item("Share")))).toBe(false);
      expect(active()).toBe(item("Share"));
      expect(onOpenChange).toHaveBeenLastCalledWith(false, {
        reason: "arrow-key",
        event: expect.any(KeyboardEvent),
      });
    },
  );

  it.skipIf(isJSDOM)(
    "focuses its trigger on Left Arrow at once, while the submenu's exit animation runs",
    async () => {
      const style = document.head.appendChild(document.createElement("style"));
      style.textContent = `
        [role="menu"][data-closed] { animation: leave 10s; }
        @keyframes leave { to { opacity: 0; } }`;
      try {
        await render(() => <Share />);
        await openToShare();
        await keyboard("{ArrowRight}");
        await nextTask();

        await keyboard("{ArrowLeft}");
        await nextTask();

        // Still shown, leaving, and focus is already back on its trigger.
        expect(shown(menuOf(item("Share")))).toBe(true);
        expect(menuOf(item("Share"))).toHaveAttribute("data-closed", "");
        expect(active()).toBe(item("Share"));
      } finally {
        style.remove();
      }
    },
  );

  it.skipIf(isJSDOM)(
    "closes an open submenu when typing moves through the parent",
    async () => {
      await render(() => <Share share={{ delay: 10_000 }} />);
      await openToShare();
      await press(centerOf(item("Share")));
      await nextTask();
      expect(shown(menuOf(item("Share")))).toBe(true);
      expect(active()).toBe(item("Share"));

      await keyboard("p");
      await nextTask();

      expect(active()).toBe(item("Paste"));
      expect(shown(menuOf(item("Share")))).toBe(false);
    },
  );

  it.skipIf(isJSDOM)(
    "right to left, opens on Left Arrow, closes on Right Arrow, and is placed on the left",
    async () => {
      await render(() => <Share dir="rtl" />);
      await openToShare();

      await keyboard("{ArrowLeft}");
      await nextTask();
      const submenu = menuOf(item("Share"));
      expect(shown(submenu)).toBe(true);
      expect(active()).toBe(item("Email"));
      await frames();
      expect(submenu).toHaveAttribute("data-side", "left");
      expect(submenu.getBoundingClientRect().right).toBeCloseTo(
        item("Share").getBoundingClientRect().left,
      );

      await keyboard("{ArrowRight}");
      await nextTask();
      expect(shown(submenu)).toBe(false);
      expect(active()).toBe(item("Share"));
    },
  );

  it.skipIf(isJSDOM)(
    "closes the submenu only on Escape, and returns focus to its trigger",
    async () => {
      await render(() => <Share />);
      await openToShare();
      await keyboard("{ArrowRight}");
      await nextTask();

      await keyboard("{Escape}");
      await nextTask();

      expect(shown(menuOf(item("Share")))).toBe(false);
      expect(shown(menu())).toBe(true);
      expect(active()).toBe(item("Share"));
    },
  );

  it.skipIf(isJSDOM)(
    "closes an open submenu when Down Arrow moves through the parent",
    async () => {
      await render(() => <Share />);
      await openToShare();
      await press(centerOf(item("Share")));
      await nextTask();
      expect(shown(menuOf(item("Share")))).toBe(true);

      item("Share").focus();
      await keyboard("{ArrowDown}");
      await nextTask();

      expect(shown(menuOf(item("Share")))).toBe(false);
      expect(active()).toBe(item("Paste"));
    },
  );

  it.skipIf(isJSDOM)(
    "opens on a click, and leaves focus on its trigger",
    async () => {
      await render(() => <Share share={{ delay: 10_000 }} />);
      await openToShare();

      await press(centerOf(item("Share")));
      await nextTask();

      expect(shown(menuOf(item("Share")))).toBe(true);
      expect(active()).toBe(item("Share"));
    },
  );

  it.skipIf(isJSDOM)(
    "closes every menu when an item in it is activated, with focus back on the Trigger",
    async () => {
      const onPrint = vi.fn();
      const onOpenChange = vi.fn();
      await render(() => (
        <Share onPrint={onPrint} onOpenChange={onOpenChange} />
      ));
      await openToShare();
      await keyboard("{ArrowRight}");
      await nextTask();
      await keyboard("{ArrowDown}{ArrowDown}");
      expect(active()).toBe(item("More"));
      await keyboard("{ArrowRight}");
      await nextTask();
      expect(active()).toBe(item("Print"));

      await keyboard("{Enter}");
      await nextTask();

      expect(onPrint).toHaveBeenCalledTimes(1);
      for (const element of [
        menu(),
        menuOf(item("Share")),
        menuOf(item("More")),
      ])
        expect(shown(element)).toBe(false);
      expect(onOpenChange).toHaveBeenLastCalledWith(false, {
        reason: "item-press",
        event: expect.any(KeyboardEvent),
      });
      expect(active()).toBe(trigger());
    },
  );

  it.skipIf(isJSDOM)(
    "is placed at the inline end of its trigger, aligned to its start",
    async () => {
      await render(() => <Share />);
      await openToShare();
      await keyboard("{ArrowRight}");
      await nextTask();
      await frames();

      const submenu = menuOf(item("Share"));
      const box = submenu.getBoundingClientRect();
      const share = item("Share").getBoundingClientRect();
      expect(submenu).toHaveAttribute("data-side", "right");
      expect(submenu).toHaveAttribute("data-align", "start");
      expect(box.left).toBeCloseTo(share.right);
      expect(box.top).toBeCloseTo(share.top);
    },
  );

  it("opens nothing from a disabled trigger", async () => {
    const onOpenChange = vi.fn();
    const { user } = await render(() => (
      <Share defaultOpen shareDisabled share={{ onOpenChange }} />
    ));
    await vi.waitFor(() => expect(active()).toBe(item("Copy")));

    await user.keyboard("{ArrowDown}");
    expect(active()).toBe(item("Share"));
    expect(item("Share")).toHaveAttribute("aria-disabled", "true");
    await user.keyboard("{ArrowRight}");
    await user.keyboard("{Enter}");
    await user.click(item("Share"));
    await afterFlush();

    expect(onOpenChange).not.toHaveBeenCalled();
    expect(item("Share")).toHaveAttribute("aria-expanded", "false");
  });
});
