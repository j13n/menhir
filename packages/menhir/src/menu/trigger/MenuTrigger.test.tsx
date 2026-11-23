// The test list and the cases left out are in ../README.md.
import { Errored } from "solid-js";
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
import { Edit } from "../../../test/menu/Edit.tsx";
import { stubMenu } from "../../../test/menu/stubMenu.ts";
import { Menu } from "../index.ts";

const popup = () => screen.getByRole("menu", { hidden: true });
const shown = () => popup().matches(":popover-open");
const trigger = () => screen.getByRole("button", { name: "Edit" });
const item = (name: string) =>
  screen.getByRole("menuitem", { name, hidden: true });

describeConformance(
  "<Menu.Trigger />",
  (props) => (
    <Menu.Root>
      <Menu.Trigger {...props} />
    </Menu.Root>
  ),
  { tagName: "BUTTON" },
);

describe("<Menu.Trigger />", () => {
  const { render } = createRenderer();
  stubMenu();
  afterEach(() => vi.restoreAllMocks());

  it("renders a button of type button with aria-haspopup menu, popovertarget and aria-controls naming the Popup", async () => {
    await render(() => <Edit />);

    expect(trigger()).toHaveAttribute("type", "button");
    expect(trigger()).toHaveAttribute("aria-haspopup", "menu");
    expect(popup().id).not.toBe("");
    expect(trigger()).toHaveAttribute("popovertarget", popup().id);
    expect(trigger()).toHaveAttribute("aria-controls", popup().id);
  });

  it("has aria-expanded false while closed and true while open", async () => {
    const { user } = await render(() => <Edit />);
    expect(trigger()).toHaveAttribute("aria-expanded", "false");

    await user.click(trigger());
    await afterFlush();

    expect(trigger()).toHaveAttribute("aria-expanded", "true");
  });

  it("is named by its content, and takes the consumer's id, which labels the Popup", async () => {
    await render(() => (
      <Edit trigger={<Menu.Trigger id="edit">Edit</Menu.Trigger>} />
    ));

    expect(trigger()).toHaveAccessibleName("Edit");
    expect(trigger().id).toBe("edit");
    expect(popup()).toHaveAttribute("aria-labelledby", "edit");
  });

  it.skipIf(isJSDOM)(
    "opens on Enter and on Space with focus on the first item",
    async () => {
      await render(() => <Edit />);
      trigger().focus();

      await keyboard("{Enter}");
      await nextTask();
      expect(shown()).toBe(true);
      expect(document.activeElement).toBe(item("Copy"));

      await keyboard("{Escape}");
      await nextTask();
      expect(shown()).toBe(false);
      expect(document.activeElement).toBe(trigger());

      await keyboard(" ");
      await nextTask();
      expect(shown()).toBe(true);
      expect(document.activeElement).toBe(item("Copy"));
    },
  );

  it("opens on Down Arrow with focus on the first item, and on Up Arrow with focus on the last", async () => {
    const onOpenChange = vi.fn();
    const { user } = await render(() => <Edit onOpenChange={onOpenChange} />);
    trigger().focus();

    await user.keyboard("{ArrowDown}");
    await afterFlush();
    expect(shown()).toBe(true);
    await vi.waitFor(() => expect(document.activeElement).toBe(item("Copy")));
    expect(onOpenChange).toHaveBeenLastCalledWith(true, {
      reason: "trigger-press",
      event: expect.any(KeyboardEvent),
    });

    await user.click(trigger());
    await afterFlush();
    expect(shown()).toBe(false);
    trigger().focus();

    await user.keyboard("{ArrowUp}");
    await afterFlush();
    expect(shown()).toBe(true);
    await vi.waitFor(() => expect(document.activeElement).toBe(item("Paste")));
    expect(item("Paste")).toHaveAttribute("data-active", "");
  });

  it.skipIf(isJSDOM)(
    "closes on a press while open, and does not open again",
    async () => {
      const onOpenChange = vi.fn();
      await render(() => <Edit onOpenChange={onOpenChange} />);

      await press(centerOf(trigger()));
      await nextTask();
      expect(shown()).toBe(true);

      await press(centerOf(trigger()));
      await nextTask();
      expect(shown()).toBe(false);
      expect(onOpenChange).toHaveBeenCalledTimes(2);
      expect(onOpenChange).toHaveBeenLastCalledWith(false, {
        reason: "trigger-press",
        event: expect.any(MouseEvent),
      });
    },
  );

  it("calls the consumer's onClick once per click", async () => {
    const onClick = vi.fn();
    const { user } = await render(() => (
      <Edit trigger={<Menu.Trigger onClick={onClick}>Edit</Menu.Trigger>} />
    ));

    await user.click(trigger());

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("warns in development when render does not render a button", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    await render(() => (
      <Menu.Root>
        <Menu.Trigger render={(props) => <span {...props} />}>
          Edit
        </Menu.Trigger>
      </Menu.Root>
    ));

    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining(
        "Menu.Trigger's render function rendered a <span>",
      ),
    );
  });

  it("throws a descriptive error outside Menu.Root", async () => {
    await render(() => (
      <Errored fallback={(error) => <p>{String(error())}</p>}>
        <Menu.Trigger>Edit</Menu.Trigger>
      </Errored>
    ));

    expect(
      screen.getByText(
        "Error: [menhir] Menu parts must be placed within <Menu.Root>, and Context Menu parts within <ContextMenu.Root>.",
      ),
    ).toBeInTheDocument();
  });
});
