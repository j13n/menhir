// The test list and the cases left out are in ../README.md.
import { Errored } from "solid-js";
import { describe, expect, it, vi } from "vitest";

import {
  afterFlush,
  createRenderer,
  fireEvent,
  describeConformance,
  isJSDOM,
  screen,
} from "#test-utils";

import {
  centerOf,
  keyboard,
  menuKey,
  nextTask,
  press,
} from "../../../test/floating/input.ts";
import { Edit } from "../../../test/context-menu/Edit.tsx";
import { stubMenu } from "../../../test/menu/stubMenu.ts";
import { Menu } from "../../menu/index.ts";
import { ContextMenu } from "../index.ts";

// The Root's menu, which holds a submenu's.
const popup = () => screen.getAllByRole("menu", { hidden: true })[0]!;
const shown = (element = popup()) => element.matches(":popover-open");
const item = (name: string) =>
  screen.getByRole("menuitem", { name, hidden: true });
const button = (name: string) =>
  screen.getByRole("button", { name, hidden: true });
const active = () => document.activeElement;
const rightPress = (x: number, y: number) => press({ x, y }, { x, y }, "right");

/** Waits for the frames in which observers report and placements land. */
async function frames(count = 3) {
  for (let i = 0; i < count; i++)
    await new Promise((resolve) => requestAnimationFrame(resolve));
}

describeConformance(
  "<ContextMenu.Popup />",
  (props) => (
    <ContextMenu.Root>
      <ContextMenu.Popup {...props} />
    </ContextMenu.Root>
  ),
  { tagName: "DIV" },
);

describe("<ContextMenu.Popup />", () => {
  const { render } = createRenderer();
  stubMenu();

  it("renders Menu's popover with the menu role, hidden until opened, labelled by nothing but its aria-label", async () => {
    await render(() => <Edit popup={{ "aria-label": "File" }} />);

    expect(popup().tagName).toBe("DIV");
    expect(popup()).toHaveAttribute("popover", "auto");
    expect(shown()).toBe(false);

    fireEvent.contextMenu(screen.getByTestId("area"));
    await afterFlush();

    expect(shown()).toBe(true);
    expect(popup()).not.toHaveAttribute("aria-labelledby");
    expect(popup()).toHaveAccessibleName("File");
  });

  it("cancels a contextmenu inside it, so the browser's menu does not show over it, and calls the consumer's onContextMenu", async () => {
    const onContextMenu = vi.fn();
    await render(() => (
      <Edit defaultOpen>
        <ContextMenu.Item>Copy</ContextMenu.Item>
        <ContextMenu.Submenu defaultOpen>
          <ContextMenu.SubmenuTrigger>Share</ContextMenu.SubmenuTrigger>
          <ContextMenu.Popup onContextMenu={onContextMenu}>
            <ContextMenu.Item>Email</ContextMenu.Item>
          </ContextMenu.Popup>
        </ContextMenu.Submenu>
      </Edit>
    ));
    await afterFlush();

    for (const name of ["Copy", "Email"]) {
      // A key's, as the Menu key on a focused item sends it.
      const event = new PointerEvent("contextmenu", {
        bubbles: true,
        cancelable: true,
        button: -1,
        pointerType: "",
      });
      fireEvent(item(name), event);
      expect(event.defaultPrevented).toBe(true);
    }
    expect(onContextMenu).toHaveBeenCalledTimes(1);
    expect(shown()).toBe(true);
  });

  it.skipIf(isJSDOM)(
    "is placed against anchor instead of the point",
    async () => {
      await render(() => (
        <Edit
          popup={{
            anchor: {
              getBoundingClientRect: () => new DOMRect(150, 160, 0, 0),
            },
          }}
        />
      ));

      await rightPress(60, 70);
      await frames();

      const { left, top } = popup().getBoundingClientRect();
      expect([left, top]).toEqual([150, 160]);
    },
  );

  it.skipIf(isJSDOM)(
    "closes on Escape, reporting escape-key, and returns focus to the element the keyboard opened it from",
    async () => {
      const onOpenChange = vi.fn();
      await render(() => <Edit onOpenChange={onOpenChange} />);
      button("Focus").focus();
      await menuKey();
      await nextTask();
      expect(active()).toBe(item("Copy"));

      await keyboard("{Escape}");
      await nextTask();

      expect(shown()).toBe(false);
      expect(onOpenChange).toHaveBeenLastCalledWith(false, {
        reason: "escape-key",
        event: expect.any(KeyboardEvent),
      });
      expect(active()).toBe(button("Focus"));
    },
  );

  it.skipIf(isJSDOM)(
    "closes on a press outside, reporting outside-press",
    async () => {
      const onOpenChange = vi.fn();
      await render(() => <Edit onOpenChange={onOpenChange} />);
      await rightPress(60, 70);
      await nextTask();

      await press(centerOf(button("After")));
      await nextTask();

      expect(shown()).toBe(false);
      expect(onOpenChange).toHaveBeenLastCalledWith(false, {
        reason: "outside-press",
        event: expect.any(PointerEvent),
      });
    },
  );

  it.skipIf(isJSDOM)("closes on Tab, reporting focus-out", async () => {
    const onOpenChange = vi.fn();
    await render(() => <Edit onOpenChange={onOpenChange} />);
    await rightPress(60, 70);
    await nextTask();
    expect(active()).toBe(item("Copy"));

    await keyboard("{Tab}");
    await nextTask();

    expect(shown()).toBe(false);
    expect(onOpenChange).toHaveBeenLastCalledWith(false, {
      reason: "focus-out",
      event: expect.any(FocusEvent),
    });
  });

  it.skipIf(isJSDOM)(
    "places a submenu's Popup against its SubmenuTrigger, not the point",
    async () => {
      await render(() => (
        <Edit>
          <ContextMenu.Item>Copy</ContextMenu.Item>
          <ContextMenu.Submenu>
            <ContextMenu.SubmenuTrigger>Share</ContextMenu.SubmenuTrigger>
            <ContextMenu.Popup aria-label="Share" data-testid="share">
              <ContextMenu.Item>Email</ContextMenu.Item>
            </ContextMenu.Popup>
          </ContextMenu.Submenu>
        </Edit>
      ));
      await rightPress(60, 70);
      await nextTask();

      await keyboard("{ArrowDown}{ArrowRight}");
      await frames();

      const share = screen.getByTestId("share");
      expect(shown(share)).toBe(true);
      const trigger = item("Share").getBoundingClientRect();
      const box = share.getBoundingClientRect();
      expect([box.left, box.top]).toEqual([trigger.right, trigger.top]);
    },
  );

  it("throws a descriptive error inside a Menu.Root", async () => {
    await render(() => (
      <Errored fallback={(error) => <p>{String(error())}</p>}>
        <Menu.Root>
          <ContextMenu.Popup />
        </Menu.Root>
      </Errored>
    ));

    expect(
      screen.getByText(
        "Error: [menhir] Context Menu parts must be placed within <ContextMenu.Root>.",
      ),
    ).toBeInTheDocument();
  });

  it("throws a descriptive error outside a Root", async () => {
    await render(() => (
      <Errored fallback={(error) => <p>{String(error())}</p>}>
        <ContextMenu.Popup />
      </Errored>
    ));

    expect(
      screen.getByText(
        "Error: [menhir] Menu parts must be placed within <Menu.Root>, Context Menu parts within <ContextMenu.Root>, and Menubar parts within <Menubar.Menu>.",
      ),
    ).toBeInTheDocument();
  });
});
