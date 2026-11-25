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
  movePointer,
  nextTask,
} from "../../../test/floating/input.ts";
import { menuKinds } from "../../../test/menu/kinds.tsx";
import { stubMenu } from "../../../test/menu/stubMenu.ts";
import { Menu } from "../index.ts";

const popup = () => screen.getByRole("menu", { hidden: true });
const shown = () => popup().matches(":popover-open");
const item = (name: string) =>
  screen.getByRole("menuitem", { name, hidden: true });
const active = () => document.activeElement;

describeConformance(
  "<Menu.Item />",
  (props) => (
    <Menu.Root>
      <Menu.Popup>
        <Menu.Item {...props} />
      </Menu.Popup>
    </Menu.Root>
  ),
  { tagName: "DIV" },
);

describe.each(menuKinds)("<Menu.Item /> in a $name", (kind) => {
  const { parts, Edit, trigger, openByPress, openByKey } = kind;
  const { render } = createRenderer();
  stubMenu();
  afterEach(() => vi.restoreAllMocks());

  it("renders a menuitem; the active item has tabindex 0 and data-active, the others -1", async () => {
    await render(() => <Edit defaultOpen />);
    await vi.waitFor(() => expect(active()).toBe(item("Copy")));

    expect(item("Copy").tagName).toBe("DIV");
    expect(item("Copy")).toHaveAttribute("tabindex", "0");
    expect(item("Copy")).toHaveAttribute("data-active", "");
    expect(item("Cut")).toHaveAttribute("tabindex", "-1");
    expect(item("Cut")).not.toHaveAttribute("data-active");
  });

  it("moves with Down and Up, wrapping, and to the first and last with Home and End", async () => {
    const { user } = await render(() => <Edit defaultOpen />);
    await vi.waitFor(() => expect(active()).toBe(item("Copy")));

    await user.keyboard("{ArrowDown}");
    expect(active()).toBe(item("Cut"));
    await user.keyboard("{ArrowUp}{ArrowUp}");
    expect(active()).toBe(item("Paste"));
    await user.keyboard("{ArrowDown}");
    expect(active()).toBe(item("Copy"));
    await user.keyboard("{End}");
    expect(active()).toBe(item("Paste"));
    await user.keyboard("{Home}");
    expect(active()).toBe(item("Copy"));
    await afterFlush();
    expect(item("Copy")).toHaveAttribute("data-active", "");
  });

  it.skipIf(isJSDOM)(
    "makes the item the pointer moves onto active",
    async () => {
      await render(() => <Edit defaultOpen />);
      await nextTask();

      await movePointer([centerOf(item("Paste"))]);
      await afterFlush();

      expect(active()).toBe(item("Paste"));
      expect(item("Paste")).toHaveAttribute("data-active", "");
    },
  );

  it("moves to the next item that starts with a typed character, matching label over content", async () => {
    const { user } = await render(() => (
      <Edit defaultOpen>
        <parts.Item>Copy</parts.Item>
        <parts.Item label="Paste">⌘V Paste</parts.Item>
        <parts.Item>Cut</parts.Item>
      </Edit>
    ));
    await vi.waitFor(() => expect(active()).toBe(item("Copy")));

    // "⌘V Paste" does not start with "p", its label does.
    await user.keyboard("p");
    expect(active()).toBe(item("⌘V Paste"));
  });

  it("calls onClick and closes the menu on a click, reporting item-press, with focus back on the Trigger", async () => {
    const onClick = vi.fn();
    const onOpenChange = vi.fn();
    const { user } = await render(() => (
      <Edit onOpenChange={onOpenChange}>
        <parts.Item onClick={onClick}>Copy</parts.Item>
      </Edit>
    ));
    await openByPress(user);
    await afterFlush();

    await user.click(item("Copy"));
    await afterFlush();

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(shown()).toBe(false);
    expect(onOpenChange).toHaveBeenLastCalledWith(false, {
      reason: "item-press",
      event: expect.any(MouseEvent),
    });
    if (!isJSDOM) {
      await nextTask();
      expect(active()).toBe(trigger());
    }
  });

  it("calls onClick and closes the menu on Enter and on Space", async () => {
    const onClick = vi.fn();
    const { user } = await render(() => (
      <Edit>
        <parts.Item onClick={onClick}>Copy</parts.Item>
      </Edit>
    ));

    for (const key of ["{Enter}", " "]) {
      await openByKey(user);
      await vi.waitFor(() => expect(active()).toBe(item("Copy")));
      await user.keyboard(key);
      await afterFlush();
      expect(shown()).toBe(false);
    }
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it("disabled: has aria-disabled and data-disabled, is reached by the keys, and is not activated", async () => {
    const onClick = vi.fn();
    const { user } = await render(() => (
      <Edit defaultOpen>
        <parts.Item>Copy</parts.Item>
        <parts.Item disabled onClick={onClick}>
          Paste
        </parts.Item>
      </Edit>
    ));
    await vi.waitFor(() => expect(active()).toBe(item("Copy")));
    expect(item("Paste")).toHaveAttribute("aria-disabled", "true");
    expect(item("Paste")).toHaveAttribute("data-disabled", "");

    await user.keyboard("{ArrowDown}");
    expect(active()).toBe(item("Paste"));
    await user.keyboard("{Enter}");
    await user.click(item("Paste"));
    await afterFlush();

    expect(onClick).not.toHaveBeenCalled();
    expect(shown()).toBe(true);
  });

  it("does not follow a disabled item rendered as a link, on a click or Enter", async () => {
    const followed: boolean[] = [];
    const record = (event: Event) => followed.push(!event.defaultPrevented);
    document.addEventListener("click", record);
    try {
      const { user } = await render(() => (
        <Edit defaultOpen>
          <parts.Item
            disabled
            render={(props) => <a {...props} href="#disabled-docs" />}
          >
            Docs
          </parts.Item>
        </Edit>
      ));
      await vi.waitFor(() => expect(active()).toBe(item("Docs")));

      await user.click(item("Docs"));
      await user.keyboard("{Enter}");
      await afterFlush();

      expect(followed.length).toBeGreaterThan(0);
      expect(followed).not.toContain(true);
      expect(location.hash).not.toBe("#disabled-docs");
      expect(shown()).toBe(true);
    } finally {
      document.removeEventListener("click", record);
    }
  });

  it.skipIf(isJSDOM)(
    "follows a link rendered with render on Enter, once",
    async () => {
      const onClick = vi.fn((event: MouseEvent) => event.preventDefault());
      await render(() => (
        <Edit defaultOpen>
          <parts.Item
            render={(props) => <a {...props} href="#docs" />}
            onClick={onClick}
          >
            Docs
          </parts.Item>
        </Edit>
      ));
      await nextTask();
      expect(active()).toBe(item("Docs"));

      await keyboard("{Enter}");
      await nextTask();

      expect(onClick).toHaveBeenCalledTimes(1);
      expect(shown()).toBe(false);
    },
  );
});
