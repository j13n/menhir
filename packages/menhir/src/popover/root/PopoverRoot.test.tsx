// The test list and the cases left out are in ../README.md.
import { createMemo, createSignal, flush, Loading } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";

import { afterFlush, createRenderer, screen } from "#test-utils";

import { stubPopover } from "../../../test/popover/stubPopover.ts";
import { Popover } from "../index.ts";
import type { PopoverRootProps } from "./PopoverRoot.tsx";

const popup = () => screen.getByRole("dialog", { hidden: true });
const shown = () => popup().matches(":popover-open");
const trigger = () => screen.getByRole("button", { name: "Notifications" });
const close = () => screen.getByRole("button", { name: "Close", hidden: true });

function Notifications(props: PopoverRootProps) {
  return (
    <Popover.Root {...props}>
      <Popover.Trigger>Notifications</Popover.Trigger>
      <Popover.Popup>
        <Popover.Arrow data-testid="arrow" />
        <Popover.Title data-testid="title">Notifications</Popover.Title>
        <Popover.Description data-testid="description">
          You are all caught up.
        </Popover.Description>
        <Popover.Close>Close</Popover.Close>
      </Popover.Popup>
    </Popover.Root>
  );
}

/** Every element a part of `Notifications` renders. */
const parts = () => [
  trigger(),
  popup(),
  screen.getByTestId("arrow"),
  screen.getByTestId("title"),
  screen.getByTestId("description"),
  close(),
];

describe("<Popover.Root />", () => {
  const { render } = createRenderer();
  stubPopover();
  afterEach(() => vi.restoreAllMocks());

  it("renders no element of its own", async () => {
    const { container } = await render(() => (
      <Popover.Root>
        <span>Inside</span>
      </Popover.Root>
    ));

    expect(container.innerHTML).toBe("<span>Inside</span>");
  });

  it("is closed by default, with data-closed on every part", async () => {
    await render(() => <Notifications />);

    expect(shown()).toBe(false);
    for (const part of parts()) {
      expect(part).toHaveAttribute("data-closed", "");
      expect(part).not.toHaveAttribute("data-open");
    }
  });

  it("starts open with defaultOpen, with data-open on every part", async () => {
    await render(() => <Notifications defaultOpen />);

    expect(shown()).toBe(true);
    for (const part of parts()) {
      expect(part).toHaveAttribute("data-open", "");
      expect(part).not.toHaveAttribute("data-closed");
    }
  });

  it("opens and closes from the Trigger and closes from Close, reporting each with its reason", async () => {
    const onOpenChange = vi.fn();
    const { user } = await render(() => (
      <Notifications onOpenChange={onOpenChange} />
    ));

    await user.click(trigger());
    await afterFlush();
    expect(shown()).toBe(true);
    expect(popup()).toHaveAttribute("data-open", "");

    await user.click(trigger());
    await afterFlush();
    expect(shown()).toBe(false);
    expect(popup()).toHaveAttribute("data-closed", "");

    await user.click(trigger());
    await afterFlush();
    await user.click(close());
    await afterFlush();
    await vi.waitFor(() => expect(shown()).toBe(false));

    expect(
      onOpenChange.mock.calls.map(([open, details]) => [
        open,
        details.reason,
        details.event.type,
      ]),
    ).toEqual([
      [true, "trigger-press", "click"],
      [false, "trigger-press", "click"],
      [true, "trigger-press", "click"],
      [false, "close-press", "click"],
    ]);
  });

  it("keeps a controlled open popover open, and asks to close it", async () => {
    const onOpenChange = vi.fn();
    const { user } = await render(() => (
      <Notifications open onOpenChange={onOpenChange} />
    ));

    await user.click(close());
    await user.click(trigger());
    await afterFlush();

    expect(onOpenChange.mock.calls.map(([open]) => open)).toEqual([
      false,
      false,
    ]);
    expect(shown()).toBe(true);
    expect(popup()).toHaveAttribute("data-open", "");
  });

  it("keeps a controlled closed popover closed, and asks to open it", async () => {
    const onOpenChange = vi.fn();
    const { user } = await render(() => (
      <Notifications open={false} onOpenChange={onOpenChange} />
    ));

    await user.click(trigger());
    await afterFlush();

    expect(onOpenChange).toHaveBeenCalledOnce();
    expect(onOpenChange.mock.calls[0]![0]).toBe(true);
    expect(shown()).toBe(false);
  });

  it("follows a controlled value changed from outside", async () => {
    const [open, setOpen] = createSignal(false);
    await render(() => <Notifications open={open()} />);

    setOpen(true);
    flush();
    expect(shown()).toBe(true);
    expect(popup()).toHaveAttribute("data-open", "");

    setOpen(false);
    flush();
    await vi.waitFor(() => expect(shown()).toBe(false));
    expect(popup()).toHaveAttribute("data-closed", "");
  });

  it("opens before async work that onOpenChange starts settles", async () => {
    const [opened, setOpened] = createSignal(false);
    let resolveDetails!: (details: string) => void;
    const { user } = await render(() => {
      const details = createMemo(() =>
        opened()
          ? new Promise<string>((resolve) => (resolveDetails = resolve))
          : "none",
      );
      return (
        <Loading fallback="loading">
          <Notifications onOpenChange={(value) => setOpened(value)} />
          <output>{details()}</output>
        </Loading>
      );
    });

    await user.click(trigger());
    await afterFlush();

    expect(screen.getByRole("status")).toHaveTextContent("none");
    expect(shown()).toBe(true);

    resolveDetails("loaded");
    await new Promise((resolve) => setTimeout(resolve));
    flush();
    expect(screen.getByRole("status")).toHaveTextContent("loaded");
  });
});
