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
  line,
  movePointer,
  nextTask,
  press,
} from "../../../test/floating/input.ts";
import { outsideRoot } from "../../../test/menu/outsideRoot.ts";
import { stubMenu } from "../../../test/menu/stubMenu.ts";
import { Editor } from "../../../test/menubar/Editor.tsx";
import { Menubar } from "../index.ts";

const barItem = (name: string) => screen.getByRole("menuitem", { name });
const item = (name: string) =>
  screen.getByRole("menuitem", { name, hidden: true });
/** The Popup that an item of the bar names in `aria-controls`. */
const menuOf = (name: string) =>
  document.getElementById(barItem(name).getAttribute("aria-controls")!)!;
const shown = (name: string) => menuOf(name).matches(":popover-open");
const active = () => document.activeElement;

describeConformance(
  "<Menubar.Trigger />",
  (props) => (
    <Menubar.Root>
      <Menubar.Menu>
        <Menubar.Trigger {...props} />
      </Menubar.Menu>
    </Menubar.Root>
  ),
  { tagName: "BUTTON" },
);

describe("<Menubar.Trigger />", () => {
  const { render } = createRenderer();
  stubMenu();
  afterEach(() => vi.restoreAllMocks());

  it("renders a button of type button with the menuitem role, aria-haspopup menu and aria-expanded, naming and labelling its Popup", async () => {
    const { user } = await render(() => <Editor />);
    const edit = barItem("Edit");

    expect(edit.tagName).toBe("BUTTON");
    expect(edit).toHaveAttribute("type", "button");
    expect(edit).toHaveAttribute("aria-haspopup", "menu");
    expect(edit).toHaveAttribute("aria-expanded", "false");
    expect(edit).toHaveAttribute("popovertarget", menuOf("Edit").id);
    expect(edit).toHaveAttribute("aria-controls", menuOf("Edit").id);
    expect(menuOf("Edit")).toHaveAttribute("aria-labelledby", edit.id);

    await user.click(edit);
    await afterFlush();
    expect(edit).toHaveAttribute("aria-expanded", "true");
  });

  it("opens its menu on Down Arrow with focus on the first item, and on Up Arrow with focus on the last", async () => {
    const onOpenChange = vi.fn();
    const { user } = await render(() => <Editor edit={{ onOpenChange }} />);
    barItem("Edit").focus();

    await user.keyboard("{ArrowDown}");
    await afterFlush();
    expect(shown("Edit")).toBe(true);
    await vi.waitFor(() => expect(active()).toBe(item("Copy")));
    expect(onOpenChange).toHaveBeenLastCalledWith(true, {
      reason: "trigger-press",
      event: expect.any(KeyboardEvent),
    });

    await user.keyboard("{Escape}");
    await user.click(barItem("Edit"));
    await afterFlush();
    expect(shown("Edit")).toBe(false);
    barItem("Edit").focus();

    await user.keyboard("{ArrowUp}");
    await afterFlush();
    await vi.waitFor(() => expect(active()).toBe(item("Paste")));
  });

  it.skipIf(isJSDOM)(
    "opens its menu on Enter and on Space with focus on the first item",
    async () => {
      await render(() => <Editor />);
      barItem("Edit").focus();

      await keyboard("{Enter}");
      await nextTask();
      expect(shown("Edit")).toBe(true);
      expect(active()).toBe(item("Copy"));

      await keyboard("{Escape}");
      await nextTask();
      expect(active()).toBe(barItem("Edit"));

      await keyboard(" ");
      await nextTask();
      expect(shown("Edit")).toBe(true);
      expect(active()).toBe(item("Copy"));
    },
  );

  it.skipIf(isJSDOM)(
    "moves focus into its open menu on Enter and on Space",
    async () => {
      await render(() => <Editor />);
      barItem("File").focus();
      await keyboard("{ArrowDown}");
      await nextTask();
      // Right on New opens Edit with focus on its item in the bar.
      await keyboard("{ArrowRight}");
      await nextTask();
      expect(shown("Edit")).toBe(true);
      expect(active()).toBe(barItem("Edit"));

      await keyboard("{Enter}");
      await nextTask();
      expect(shown("Edit")).toBe(true);
      expect(active()).toBe(item("Copy"));

      await keyboard("{ArrowRight}");
      await nextTask();
      expect(active()).toBe(barItem("View"));
      await keyboard(" ");
      await nextTask();
      expect(shown("View")).toBe(true);
      expect(active()).toBe(item("Zoom in"));
    },
  );

  it.skipIf(isJSDOM)(
    "opens its menu on a press with focus on the first item, and closes it on a press while open",
    async () => {
      await render(() => <Editor />);

      await press(centerOf(barItem("Edit")));
      await nextTask();
      expect(shown("Edit")).toBe(true);
      expect(active()).toBe(item("Copy"));

      await press(centerOf(barItem("Edit")));
      await nextTask();
      expect(shown("Edit")).toBe(false);
    },
  );

  it("moves along the bar with a menu open, closing it and opening the next item's with focus on that item", async () => {
    const onFileChange = vi.fn();
    const onEditChange = vi.fn();
    const { user } = await render(() => (
      <Editor
        file={{ onOpenChange: onFileChange }}
        edit={{ onOpenChange: onEditChange }}
      />
    ));
    barItem("File").focus();
    await user.keyboard("{ArrowDown}");
    await afterFlush();
    // Focus back on the bar, with File's menu open.
    barItem("File").focus();

    await user.keyboard("{ArrowRight}");
    await afterFlush();

    expect(shown("File")).toBe(false);
    expect(shown("Edit")).toBe(true);
    expect(active()).toBe(barItem("Edit"));
    expect(onFileChange).toHaveBeenLastCalledWith(false, {
      reason: "arrow-key",
      event: expect.any(KeyboardEvent),
    });
    expect(onEditChange).toHaveBeenLastCalledWith(true, {
      reason: "arrow-key",
      event: expect.any(KeyboardEvent),
    });
    // Focus stays on the bar while the menu shows.
    await nextTask();
    expect(active()).toBe(barItem("Edit"));
    expect(item("Copy")).not.toHaveAttribute("data-active");

    for (const [key, name] of [
      ["{ArrowLeft}", "File"],
      ["{End}", "View"],
      ["{Home}", "File"],
      ["e", "Edit"],
    ]) {
      await user.keyboard(key);
      await afterFlush();
      expect(active()).toBe(barItem(name));
      for (const other of ["File", "Edit", "View"])
        expect(shown(other)).toBe(other === name);
    }
  });

  it.skipIf(isJSDOM)(
    "opens another item's menu at once when the pointer moves onto it while a menu is open, and focuses that item",
    async () => {
      const onFileChange = vi.fn();
      const onEditChange = vi.fn();
      await render(() => (
        <Editor
          file={{ onOpenChange: onFileChange }}
          edit={{ onOpenChange: onEditChange }}
        />
      ));
      await press(centerOf(barItem("File")));
      await nextTask();
      expect(shown("File")).toBe(true);

      await movePointer(
        line(centerOf(barItem("File")), centerOf(barItem("Edit")), 4),
      );
      await nextTask();

      expect(shown("File")).toBe(false);
      expect(shown("Edit")).toBe(true);
      expect(active()).toBe(barItem("Edit"));
      expect(onFileChange).toHaveBeenLastCalledWith(false, {
        reason: "trigger-hover",
        event: expect.any(PointerEvent),
      });
      expect(onEditChange).toHaveBeenLastCalledWith(true, {
        reason: "trigger-hover",
        event: expect.any(PointerEvent),
      });
    },
  );

  it.skipIf(isJSDOM)(
    "keeps open the menu hover opened on a press of its item, with focus on its first item, and closes it on a press once the pointer has left and come back",
    async () => {
      await render(() => <Editor />);
      await press(centerOf(barItem("File")));
      await nextTask();

      // The press moves the pointer onto Edit, which hover opens, first.
      await press(centerOf(barItem("Edit")));
      await nextTask();
      expect(shown("File")).toBe(false);
      expect(shown("Edit")).toBe(true);
      expect(active()).toBe(item("Copy"));

      await movePointer([centerOf(item("Cut")), centerOf(barItem("Edit"))]);
      await press(centerOf(barItem("Edit")));
      await nextTask();
      expect(shown("Edit")).toBe(false);
    },
  );

  it.skipIf(isJSDOM)(
    "opens nothing when the pointer moves over the items with no menu open",
    async () => {
      await render(() => <Editor />);

      await movePointer(
        line(centerOf(barItem("File")), centerOf(barItem("View")), 6),
      );
      await nextTask();

      for (const name of ["File", "Edit", "View"])
        expect(shown(name)).toBe(false);
    },
  );

  it.skipIf(isJSDOM)(
    "closes its menu on Escape and returns focus to the item",
    async () => {
      const onOpenChange = vi.fn();
      await render(() => <Editor edit={{ onOpenChange }} />);
      barItem("Edit").focus();
      await keyboard("{ArrowDown}");
      await nextTask();
      expect(active()).toBe(item("Copy"));

      await keyboard("{Escape}");
      await nextTask();

      expect(shown("Edit")).toBe(false);
      expect(active()).toBe(barItem("Edit"));
      expect(onOpenChange).toHaveBeenLastCalledWith(false, {
        reason: "escape-key",
        event: expect.any(KeyboardEvent),
      });
    },
  );

  it.skipIf(isJSDOM)(
    "with focus on the item and its menu open, closes the menu on Escape, and on Tab, which leaves the bar",
    async () => {
      const onOpenChange = vi.fn();
      await render(() => <Editor edit={{ onOpenChange }} />);
      barItem("File").focus();
      await keyboard("{ArrowDown}{ArrowRight}");
      await nextTask();
      expect(shown("Edit")).toBe(true);
      expect(active()).toBe(barItem("Edit"));

      await keyboard("{Escape}");
      await nextTask();
      expect(shown("Edit")).toBe(false);
      expect(active()).toBe(barItem("Edit"));

      await keyboard("{ArrowLeft}{ArrowDown}{ArrowRight}");
      await nextTask();
      expect(shown("Edit")).toBe(true);
      expect(active()).toBe(barItem("Edit"));

      await keyboard("{Tab}");
      await nextTask();
      expect(shown("Edit")).toBe(false);
      expect(active()).toBe(screen.getByRole("button", { name: "After" }));
      expect(onOpenChange).toHaveBeenLastCalledWith(false, {
        reason: "focus-out",
        event: expect.any(KeyboardEvent),
      });
    },
  );

  it("calls the consumer's onClick and onKeyDown", async () => {
    const onClick = vi.fn();
    const onKeyDown = vi.fn();
    const { user } = await render(() => (
      <Menubar.Root>
        <Menubar.Menu>
          <Menubar.Trigger onClick={onClick} onKeyDown={onKeyDown}>
            Edit
          </Menubar.Trigger>
          <Menubar.Popup>
            <Menubar.Item>Copy</Menubar.Item>
          </Menubar.Popup>
        </Menubar.Menu>
      </Menubar.Root>
    ));

    barItem("Edit").focus();
    await user.keyboard("{ArrowRight}");
    await user.click(barItem("Edit"));

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onKeyDown).toHaveBeenCalled();
  });

  it("warns in development when render does not render a button", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    await render(() => (
      <Menubar.Root>
        <Menubar.Menu>
          <Menubar.Trigger render={(props) => <div {...props} />}>
            Edit
          </Menubar.Trigger>
        </Menubar.Menu>
      </Menubar.Root>
    ));

    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining(
        "Menubar.Trigger's render function rendered a <div>",
      ),
    );
  });

  it("throws a descriptive error outside Menubar.Menu", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    await render(() => (
      <Errored fallback={(error) => <p>{String(error())}</p>}>
        <Menubar.Root>
          <Menubar.Trigger />
        </Menubar.Root>
      </Errored>
    ));

    expect(screen.getByText(outsideRoot)).toBeInTheDocument();
  });
});
