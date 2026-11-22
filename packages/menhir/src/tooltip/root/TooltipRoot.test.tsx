// The test list and the cases left out are in ../README.md.
import { createMemo, createSignal, flush, Loading } from "solid-js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { afterFlush, createRenderer, fireEvent, screen } from "#test-utils";

import { enter, leave, wait } from "../../../test/floating/hover/helpers.ts";
import { stubPopover } from "../../../test/popover/stubPopover.ts";
import { Tooltip } from "../index.ts";
import type { TooltipRootProps } from "./TooltipRoot.tsx";

const popup = () => screen.getByRole("tooltip", { hidden: true });
const shown = () => popup().matches(":popover-open");
const trigger = () => screen.getByRole("button", { name: "Bold" });

function Bold(props: TooltipRootProps) {
  return (
    <Tooltip.Root {...props}>
      <Tooltip.Trigger>Bold</Tooltip.Trigger>
      <Tooltip.Popup>
        <Tooltip.Arrow data-testid="arrow" />
        Ctrl+B
      </Tooltip.Popup>
    </Tooltip.Root>
  );
}

/** Every element a part of `Bold` renders. */
const parts = () => [trigger(), popup(), screen.getByTestId("arrow")];

/** Opens `Bold` by hover, with no delay, and forgets the report. */
async function hoverOpen(onOpenChange?: ReturnType<typeof vi.fn>) {
  enter(trigger());
  await wait(600);
  expect(shown()).toBe(true);
  onOpenChange?.mockClear();
}

describe("<Tooltip.Root />", () => {
  const { render } = createRenderer();
  stubPopover();
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("renders no element of its own", async () => {
    const { container } = await render(() => (
      <Tooltip.Root>
        <span>Inside</span>
      </Tooltip.Root>
    ));

    expect(container.innerHTML).toBe("<span>Inside</span>");
  });

  it("is closed by default, with data-closed on every part", async () => {
    await render(() => <Bold />);

    expect(shown()).toBe(false);
    for (const part of parts()) {
      expect(part).toHaveAttribute("data-closed", "");
      expect(part).not.toHaveAttribute("data-open");
    }
  });

  it("starts open with defaultOpen, with data-open on every part", async () => {
    await render(() => <Bold defaultOpen />);

    expect(shown()).toBe(true);
    for (const part of parts()) {
      expect(part).toHaveAttribute("data-open", "");
      expect(part).not.toHaveAttribute("data-closed");
    }
  });

  it("opens after 600 ms of a mouse resting on the Trigger, reporting trigger-hover with the pointerenter", async () => {
    const onOpenChange = vi.fn();
    await render(() => <Bold onOpenChange={onOpenChange} />);

    enter(trigger());
    await wait(599);
    expect(shown()).toBe(false);
    await wait(1);

    expect(shown()).toBe(true);
    expect(popup()).toHaveAttribute("data-open", "");
    expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(true, {
      reason: "trigger-hover",
      event: expect.objectContaining({ type: "pointerenter" }),
    });
  });

  it("takes delay and closeDelay", async () => {
    await render(() => <Bold delay={100} closeDelay={200} />);

    enter(trigger());
    await wait(100);
    expect(shown()).toBe(true);

    leave(trigger());
    await wait(199);
    expect(shown()).toBe(true);
    await wait(1);
    expect(shown()).toBe(false);
  });

  it("closes when the pointer leaves the Trigger, reporting trigger-hover", async () => {
    const onOpenChange = vi.fn();
    await render(() => <Bold onOpenChange={onOpenChange} />);
    await hoverOpen(onOpenChange);

    leave(trigger());
    await afterFlush();

    expect(shown()).toBe(false);
    expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false, {
      reason: "trigger-hover",
      event: expect.objectContaining({ type: "pointermove" }),
    });
  });

  it("closes on Escape, reporting escape-key, and leaves focus on the Trigger", async () => {
    const onOpenChange = vi.fn();
    await render(() => <Bold onOpenChange={onOpenChange} />);
    trigger().focus();
    await afterFlush();
    expect(shown()).toBe(true);
    onOpenChange.mockClear();

    fireEvent.keyDown(trigger(), { key: "Escape" });
    await afterFlush();

    expect(shown()).toBe(false);
    expect(document.activeElement).toBe(trigger());
    expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false, {
      reason: "escape-key",
      event: expect.objectContaining({ type: "keydown", key: "Escape" }),
    });
  });

  it("keeps a controlled open tooltip open, and asks to close it", async () => {
    const onOpenChange = vi.fn();
    await render(() => <Bold open onOpenChange={onOpenChange} />);

    enter(trigger());
    leave(trigger());
    // A set repeated in the same turn is dropped (createControllableSignal).
    await afterFlush();
    fireEvent.keyDown(trigger(), { key: "Escape" });
    await afterFlush();

    expect(
      onOpenChange.mock.calls.map(([open, d]) => [open, d.reason]),
    ).toEqual([
      [false, "trigger-hover"],
      [false, "escape-key"],
    ]);
    expect(shown()).toBe(true);
  });

  it("keeps a controlled closed tooltip closed, and asks to open it", async () => {
    const onOpenChange = vi.fn();
    await render(() => <Bold open={false} onOpenChange={onOpenChange} />);

    enter(trigger());
    await wait(600);
    trigger().focus();
    await afterFlush();

    expect(
      onOpenChange.mock.calls.map(([open, d]) => [open, d.reason]),
    ).toEqual([
      [true, "trigger-hover"],
      [true, "trigger-focus"],
    ]);
    expect(shown()).toBe(false);
  });

  it("follows a controlled value changed from outside", async () => {
    const [open, setOpen] = createSignal(false);
    await render(() => <Bold open={open()} />);

    setOpen(true);
    flush();
    expect(shown()).toBe(true);
    expect(popup()).toHaveAttribute("data-open", "");

    setOpen(false);
    flush();
    expect(shown()).toBe(false);
    expect(popup()).toHaveAttribute("data-closed", "");
  });

  it("opens before async work that onOpenChange starts settles", async () => {
    const [opened, setOpened] = createSignal(false);
    let resolveDetails!: (details: string) => void;
    await render(() => {
      const details = createMemo(() =>
        opened()
          ? new Promise<string>((resolve) => (resolveDetails = resolve))
          : "none",
      );
      return (
        <Loading fallback="loading">
          <Bold onOpenChange={(value) => setOpened(value)} />
          <output>{details()}</output>
        </Loading>
      );
    });

    trigger().focus();
    await afterFlush();

    expect(screen.getByRole("status")).toHaveTextContent("none");
    expect(shown()).toBe(true);

    resolveDetails("loaded");
    await vi.advanceTimersByTimeAsync(1);
    flush();
    expect(screen.getByRole("status")).toHaveTextContent("loaded");
  });
});
