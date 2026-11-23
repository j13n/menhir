// The test list and the cases left out are in ../README.md.
import { Errored } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  afterFlush,
  createRenderer,
  describeConformance,
  fireEvent,
  isJSDOM,
  screen,
} from "#test-utils";

import {
  keyboard,
  menuKey,
  nextTask,
  press,
} from "../../../test/floating/input.ts";

import { area as areaTrigger, Edit } from "../../../test/context-menu/Edit.tsx";
import { stubMenu } from "../../../test/menu/stubMenu.ts";
import { ContextMenu } from "../index.ts";

// The Root's menu, which holds a submenu's.
const popup = () => screen.getAllByRole("menu", { hidden: true })[0]!;
const shown = () => popup().matches(":popover-open");
const area = () => screen.getByTestId("area");
const item = (name: string) =>
  screen.getByRole("menuitem", { name, hidden: true });
const active = () => document.activeElement;
const button = (name: string) =>
  screen.getByRole("button", { name, hidden: true });
const corner = () => {
  const { left, top } = popup().getBoundingClientRect();
  return [left, top];
};

/** Waits for the frames in which observers report and placements land. */
async function frames(count = 3) {
  for (let i = 0; i < count; i++)
    await new Promise((resolve) => requestAnimationFrame(resolve));
}

/** A secondary-button press at a point, as a mouse sends it. */
const rightPress = (x: number, y: number) => press({ x, y }, { x, y }, "right");

/** Fires a `contextmenu` at `target`, and returns whether it was cancelled. */
function contextMenu(target: Element, init: PointerEventInit = {}) {
  const event = new PointerEvent("contextmenu", {
    bubbles: true,
    cancelable: true,
    button: 2,
    pointerType: "mouse",
    clientX: 50,
    clientY: 60,
    ...init,
  });
  fireEvent(target, event);
  return event.defaultPrevented;
}

describeConformance(
  "<ContextMenu.Trigger />",
  (props) => (
    <ContextMenu.Root>
      <ContextMenu.Trigger {...props} />
    </ContextMenu.Root>
  ),
  { tagName: "DIV" },
);

describe("<ContextMenu.Trigger />", () => {
  const { render } = createRenderer();
  stubMenu();
  afterEach(() => vi.restoreAllMocks());

  it("renders a div with no role, no ARIA popup attributes and no tabindex", async () => {
    await render(() => (
      <ContextMenu.Root>
        <ContextMenu.Trigger data-testid="area">Files</ContextMenu.Trigger>
      </ContextMenu.Root>
    ));

    expect(area().tagName).toBe("DIV");
    for (const name of [
      "role",
      "aria-haspopup",
      "aria-expanded",
      "aria-controls",
      "tabindex",
    ])
      expect(area()).not.toHaveAttribute(name);
    expect(area()).toHaveAttribute("data-closed", "");
  });

  it("opens the menu on a contextmenu, which it cancels, with focus on the first item", async () => {
    await render(() => <Edit />);

    expect(contextMenu(area())).toBe(true);
    await afterFlush();

    expect(shown()).toBe(true);
    expect(area()).toHaveAttribute("data-open", "");
    await vi.waitFor(() => expect(active()).toBe(item("Copy")));
  });

  it.skipIf(isJSDOM)(
    "opens at the pointer on a secondary-button press, and stays open once it is released",
    async () => {
      await render(() => <Edit />);

      await rightPress(60, 70);
      await frames();

      expect(shown()).toBe(true);
      expect(corner()).toEqual([60, 70]);
      expect(popup()).toHaveAttribute("data-side", "bottom");
      expect(active()).toBe(item("Copy"));
    },
  );

  it.skipIf(isJSDOM)(
    "flips above the pointer near the bottom edge, and stays open once released outside it",
    async () => {
      await render(() => (
        <Edit
          trigger={
            <ContextMenu.Trigger
              data-testid="area"
              style={{ position: "fixed", inset: 0 }}
            />
          }
        />
      ));
      const y = window.innerHeight - 5;

      // The release lands on the menu's bottom edge, outside its box.
      await rightPress(60, y);
      await frames();

      expect(shown()).toBe(true);
      expect(popup()).toHaveAttribute("data-side", "top");
      const box = popup().getBoundingClientRect();
      expect([box.left, box.bottom]).toEqual([60, y]);
    },
  );

  it.skipIf(isJSDOM)(
    "opens below the focused element on the Menu key, with focus on the first item",
    async () => {
      await render(() => <Edit />);
      button("Focus").focus();

      await menuKey();
      await frames();

      expect(shown()).toBe(true);
      // The Focus button is 60 by 20 at (120, 90).
      expect(corner()).toEqual([120, 110]);
      expect(active()).toBe(item("Copy"));
    },
  );

  it.skipIf(isJSDOM)("opens at the finger on a touch long press", async () => {
    await render(() => <Edit />);

    // As Chromium on macOS sends it for a long press through the DevTools
    // protocol, with no button like a key's; Chromium on Linux sends none.
    contextMenu(area(), {
      button: -1,
      pointerType: "touch",
      clientX: 60,
      clientY: 70,
    });
    await frames();

    expect(shown()).toBe(true);
    expect(corner()).toEqual([60, 70]);
  });

  it.skipIf(isJSDOM)(
    "moves to a second press while open, without closing, closing its submenu and focusing the first item",
    async () => {
      const onOpenChange = vi.fn();
      await render(() => (
        <Edit onOpenChange={onOpenChange}>
          <ContextMenu.Item>Copy</ContextMenu.Item>
          <ContextMenu.Submenu>
            <ContextMenu.SubmenuTrigger>Share</ContextMenu.SubmenuTrigger>
            <ContextMenu.Popup aria-label="Share">
              <ContextMenu.Item>Email</ContextMenu.Item>
            </ContextMenu.Popup>
          </ContextMenu.Submenu>
        </Edit>
      ));
      await rightPress(60, 70);
      await frames();
      await keyboard("{ArrowDown}{ArrowRight}");
      await nextTask();
      expect(active()).toBe(item("Email"));

      await rightPress(150, 120);
      await frames();

      expect(shown()).toBe(true);
      expect(corner()).toEqual([150, 120]);
      expect(item("Email").closest("[popover]")!.matches(":popover-open")).toBe(
        false,
      );
      expect(active()).toBe(item("Copy"));
      expect(onOpenChange).toHaveBeenCalledTimes(1);
      expect(onOpenChange).toHaveBeenCalledWith(true, {
        reason: "trigger-press",
        event: expect.any(MouseEvent),
      });
    },
  );

  it("disabled: does not cancel a contextmenu or open, and has data-disabled", async () => {
    await render(() => <Edit trigger={areaTrigger({ disabled: true })} />);

    expect(contextMenu(area())).toBe(false);
    await afterFlush();

    expect(shown()).toBe(false);
    expect(area()).toHaveAttribute("data-disabled", "");
  });

  it("calls the consumer's onContextMenu", async () => {
    const onContextMenu = vi.fn();
    await render(() => (
      <ContextMenu.Root>
        <ContextMenu.Trigger data-testid="area" onContextMenu={onContextMenu} />
      </ContextMenu.Root>
    ));

    contextMenu(area());

    expect(onContextMenu).toHaveBeenCalledTimes(1);
  });

  it("throws a descriptive error outside ContextMenu.Root", async () => {
    await render(() => (
      <Errored fallback={(error) => <p>{String(error())}</p>}>
        <ContextMenu.Trigger />
      </Errored>
    ));

    expect(
      screen.getByText(
        "Error: [menhir] Context Menu parts must be placed within <ContextMenu.Root>.",
      ),
    ).toBeInTheDocument();
  });
});
