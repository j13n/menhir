// The test list and the cases left out are in ../README.md.
import { createSignal, flush } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";

import { afterFlush, createRenderer, screen } from "#test-utils";

import { Edit } from "../../../test/menu/Edit.tsx";
import { stubMenu } from "../../../test/menu/stubMenu.ts";
import { Menu } from "../index.ts";

const popup = () => screen.getByRole("menu", { hidden: true });
const shown = () => popup().matches(":popover-open");
const trigger = () => screen.getByRole("button", { name: "Edit" });
const item = (name: string) =>
  screen.getByRole("menuitem", { name, hidden: true });

describe("<Menu.Root />", () => {
  const { render } = createRenderer();
  stubMenu();
  afterEach(() => vi.restoreAllMocks());

  it("renders no element of its own", async () => {
    const { container } = await render(() => (
      <Menu.Root>
        <span>Inside</span>
      </Menu.Root>
    ));

    expect(container.innerHTML).toBe("<span>Inside</span>");
  });

  it("is closed by default, with data-closed on the Trigger and the Popup", async () => {
    await render(() => <Edit />);

    expect(shown()).toBe(false);
    for (const part of [trigger(), popup()]) {
      expect(part).toHaveAttribute("data-closed", "");
      expect(part).not.toHaveAttribute("data-open");
    }
  });

  it("starts open with defaultOpen, with data-open and focus on the first item", async () => {
    await render(() => <Edit defaultOpen />);
    await afterFlush();

    expect(shown()).toBe(true);
    for (const part of [trigger(), popup()]) {
      expect(part).toHaveAttribute("data-open", "");
      expect(part).not.toHaveAttribute("data-closed");
    }
    await vi.waitFor(() => expect(document.activeElement).toBe(item("Copy")));
    expect(item("Copy")).toHaveAttribute("data-active", "");
  });

  it("opens and closes from the Trigger, reporting each with its reason and event", async () => {
    const onOpenChange = vi.fn();
    const { user } = await render(() => <Edit onOpenChange={onOpenChange} />);

    await user.click(trigger());
    await afterFlush();
    expect(shown()).toBe(true);
    expect(onOpenChange).toHaveBeenLastCalledWith(true, {
      reason: "trigger-press",
      event: expect.any(MouseEvent),
    });

    await user.click(trigger());
    await afterFlush();
    expect(shown()).toBe(false);
    expect(onOpenChange).toHaveBeenLastCalledWith(false, {
      reason: "trigger-press",
      event: expect.any(MouseEvent),
    });
    expect(onOpenChange).toHaveBeenCalledTimes(2);
  });

  it("only asks when controlled open, and stays open", async () => {
    const onOpenChange = vi.fn();
    const { user } = await render(() => (
      <Edit open onOpenChange={onOpenChange} />
    ));

    await user.click(trigger());
    await afterFlush();

    expect(onOpenChange).toHaveBeenCalledWith(false, expect.anything());
    expect(shown()).toBe(true);
  });

  it("only asks when controlled closed, and stays closed", async () => {
    const onOpenChange = vi.fn();
    const { user } = await render(() => (
      <Edit open={false} onOpenChange={onOpenChange} />
    ));

    await user.click(trigger());
    await afterFlush();

    expect(onOpenChange).toHaveBeenCalledWith(true, expect.anything());
    expect(shown()).toBe(false);
  });

  it("follows a controlled value changed from outside, with focus on the first item when it opens", async () => {
    const [open, setOpen] = createSignal(false);
    await render(() => <Edit open={open()} />);

    setOpen(true);
    flush();
    expect(shown()).toBe(true);
    await vi.waitFor(() => expect(document.activeElement).toBe(item("Copy")));

    setOpen(false);
    flush();
    expect(shown()).toBe(false);
  });
});
