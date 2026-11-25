// The test list and the cases left out are in ../README.md.
import { createSignal } from "solid-js";
import { describe, expect, it, vi } from "vitest";

import { afterFlush, createRenderer, isJSDOM, screen } from "#test-utils";

import { fireContextMenu } from "../../../test/context-menu/contextMenu.ts";
import { Edit } from "../../../test/context-menu/Edit.tsx";
import { stubMenu } from "../../../test/menu/stubMenu.ts";
import { ContextMenu } from "../index.ts";

const popup = () => screen.getByRole("menu", { hidden: true });
const shown = () => popup().matches(":popover-open");
const area = () => screen.getByTestId("area");
const item = (name: string) =>
  screen.getByRole("menuitem", { name, hidden: true });
const active = () => document.activeElement;

/** Waits for the frames in which observers report and placements land. */
async function frames(count = 3) {
  for (let i = 0; i < count; i++)
    await new Promise((resolve) => requestAnimationFrame(resolve));
}

describe("<ContextMenu.Root />", () => {
  const { render } = createRenderer();
  stubMenu();

  it("renders no element of its own", async () => {
    const { container } = await render(() => (
      <ContextMenu.Root>
        <span>child</span>
      </ContextMenu.Root>
    ));

    expect(container.innerHTML).toBe("<span>child</span>");
  });

  it("is closed by default, with data-closed on the Trigger and the Popup", async () => {
    await render(() => <Edit />);

    expect(shown()).toBe(false);
    expect(area()).toHaveAttribute("data-closed", "");
    expect(popup()).toHaveAttribute("data-closed", "");
  });

  it("starts open with defaultOpen, with data-open and focus on the first item", async () => {
    await render(() => <Edit defaultOpen />);
    await afterFlush();

    expect(shown()).toBe(true);
    expect(area()).toHaveAttribute("data-open", "");
    expect(popup()).toHaveAttribute("data-open", "");
    await vi.waitFor(() => expect(active()).toBe(item("Copy")));
  });

  it.skipIf(isJSDOM)(
    "places a defaultOpen menu below the Trigger, aligned to its start",
    async () => {
      await render(() => <Edit defaultOpen />);
      await frames();

      // The area is 200 by 100 at (20, 40).
      const { left, top } = popup().getBoundingClientRect();
      expect([left, top]).toEqual([20, 140]);
    },
  );

  it("uncontrolled: a contextmenu opens it, reporting trigger-press with the event", async () => {
    const onOpenChange = vi.fn();
    await render(() => <Edit onOpenChange={onOpenChange} />);

    fireContextMenu(area());
    await afterFlush();

    expect(shown()).toBe(true);
    expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(true, {
      reason: "trigger-press",
      event: expect.any(MouseEvent),
    });
  });

  it("controlled closed: a contextmenu only asks, and the menu stays closed", async () => {
    const onOpenChange = vi.fn();
    await render(() => <Edit open={false} onOpenChange={onOpenChange} />);

    fireContextMenu(area());
    await afterFlush();

    expect(onOpenChange).toHaveBeenCalledWith(true, expect.anything());
    expect(shown()).toBe(false);
  });

  it("follows a controlled value changed from outside, with focus on the first item", async () => {
    const [open, setOpen] = createSignal(false);
    await render(() => <Edit open={open()} />);

    setOpen(true);
    await afterFlush();

    expect(shown()).toBe(true);
    await vi.waitFor(() => expect(active()).toBe(item("Copy")));

    setOpen(false);
    await afterFlush();

    expect(shown()).toBe(false);
  });
});
