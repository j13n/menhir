// The test list and the cases left out are in ../README.md.
import { createMemo, createSignal, flush, Loading, Show } from "solid-js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { afterFlush, createRenderer, fireEvent, screen } from "#test-utils";

import { enter, leave, wait } from "../../../test/floating/hover/helpers.ts";
import { stubPopover } from "../../../test/popover/stubPopover.ts";
import { PreviewCard } from "../index.ts";
import type { PreviewCardRootProps } from "./PreviewCardRoot.tsx";

const popup = () => screen.getByTestId("popup");
const shown = () => popup().matches(":popover-open");
const trigger = () => screen.getByRole("link", { name: "Ada" });

function Ada(props: PreviewCardRootProps) {
  return (
    <PreviewCard.Root {...props}>
      <PreviewCard.Trigger href="#ada">Ada</PreviewCard.Trigger>
      <PreviewCard.Popup data-testid="popup">
        <PreviewCard.Arrow data-testid="arrow" />
        Ada Lovelace, analyst
      </PreviewCard.Popup>
    </PreviewCard.Root>
  );
}

/** Every element a part of `Ada` renders. */
const parts = () => [trigger(), popup(), screen.getByTestId("arrow")];

/** Opens `Ada` by hover, and forgets the report. */
async function hoverOpen(onOpenChange?: ReturnType<typeof vi.fn>) {
  enter(trigger());
  await wait(700);
  expect(shown()).toBe(true);
  onOpenChange?.mockClear();
}

const reasons = (onOpenChange: ReturnType<typeof vi.fn>) =>
  onOpenChange.mock.calls.map(([open, details]) => [open, details.reason]);

describe("<PreviewCard.Root />", () => {
  const { render } = createRenderer();
  stubPopover();
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("renders no element of its own", async () => {
    const { container } = await render(() => (
      <PreviewCard.Root>
        <span>Inside</span>
      </PreviewCard.Root>
    ));

    expect(container.innerHTML).toBe("<span>Inside</span>");
  });

  it("is closed by default, with data-closed on every part", async () => {
    await render(() => <Ada />);

    expect(shown()).toBe(false);
    for (const part of parts()) {
      expect(part).toHaveAttribute("data-closed", "");
      expect(part).not.toHaveAttribute("data-open");
    }
  });

  it("starts open with defaultOpen, with data-open on every part", async () => {
    await render(() => <Ada defaultOpen />);

    expect(shown()).toBe(true);
    for (const part of parts()) {
      expect(part).toHaveAttribute("data-open", "");
      expect(part).not.toHaveAttribute("data-closed");
    }
  });

  it("opens after 700 ms of a mouse resting on the Trigger, reporting trigger-hover with the pointerenter", async () => {
    const onOpenChange = vi.fn();
    await render(() => <Ada onOpenChange={onOpenChange} />);

    enter(trigger());
    await wait(699);
    expect(shown()).toBe(false);
    await wait(1);

    expect(shown()).toBe(true);
    expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(true, {
      reason: "trigger-hover",
      event: expect.objectContaining({ type: "pointerenter" }),
    });
  });

  it("closes 300 ms after the pointer leaves the Trigger, reporting trigger-hover, unless it comes back", async () => {
    const onOpenChange = vi.fn();
    await render(() => <Ada onOpenChange={onOpenChange} />);
    await hoverOpen(onOpenChange);

    leave(trigger());
    await wait(299);
    expect(shown()).toBe(true);
    enter(trigger());
    await wait(1000);
    expect(shown()).toBe(true);

    leave(trigger());
    await wait(300);
    expect(shown()).toBe(false);
    expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false, {
      reason: "trigger-hover",
      event: expect.objectContaining({ type: "pointermove" }),
    });
  });

  it("takes delay and closeDelay", async () => {
    await render(() => <Ada delay={100} closeDelay={0} />);

    enter(trigger());
    await wait(100);
    expect(shown()).toBe(true);

    leave(trigger());
    await afterFlush();
    expect(shown()).toBe(false);
  });

  it("closes on Escape, reporting escape-key, and leaves focus on the Trigger", async () => {
    const onOpenChange = vi.fn();
    await render(() => <Ada onOpenChange={onOpenChange} />);
    trigger().focus();
    await wait(700);
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

  it("keeps a controlled open card open, and asks to close it", async () => {
    const onOpenChange = vi.fn();
    await render(() => <Ada open closeDelay={0} onOpenChange={onOpenChange} />);

    enter(trigger());
    leave(trigger());
    // A set repeated in the same turn is dropped (createControllableSignal).
    await afterFlush();
    fireEvent.keyDown(trigger(), { key: "Escape" });
    await afterFlush();

    expect(reasons(onOpenChange)).toEqual([
      [false, "trigger-hover"],
      [false, "escape-key"],
    ]);
    expect(shown()).toBe(true);
  });

  it("keeps a controlled closed card closed, and asks to open it", async () => {
    const onOpenChange = vi.fn();
    await render(() => <Ada open={false} onOpenChange={onOpenChange} />);

    enter(trigger());
    await wait(700);
    leave(trigger());
    trigger().focus();
    await wait(700);

    expect(reasons(onOpenChange)).toEqual([
      [true, "trigger-hover"],
      [true, "trigger-focus"],
    ]);
    expect(shown()).toBe(false);
  });

  it("follows a controlled value changed from outside", async () => {
    const [open, setOpen] = createSignal(false);
    await render(() => <Ada open={open()} />);

    setOpen(true);
    flush();
    expect(shown()).toBe(true);
    expect(popup()).toHaveAttribute("data-open", "");

    setOpen(false);
    flush();
    expect(shown()).toBe(false);
    expect(popup()).toHaveAttribute("data-closed", "");
  });

  it("opens nothing, and leaves no timer, when disposed while a delay is pending", async () => {
    const [mounted, setMounted] = createSignal(true);
    const onOpenChange = vi.fn();
    await render(() => (
      <Show when={mounted()}>
        <Ada onOpenChange={onOpenChange} />
      </Show>
    ));

    enter(trigger());
    trigger().focus();
    await afterFlush();
    setMounted(false);
    flush();

    await wait(1000);

    expect(onOpenChange).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
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
          <Ada onOpenChange={(value) => setOpened(value)} />
          <output>{details()}</output>
        </Loading>
      );
    });

    enter(trigger());
    await wait(700);

    expect(screen.getByRole("status")).toHaveTextContent("none");
    expect(shown()).toBe(true);

    resolveDetails("loaded");
    await vi.advanceTimersByTimeAsync(1);
    flush();
    expect(screen.getByRole("status")).toHaveTextContent("loaded");
  });
});
