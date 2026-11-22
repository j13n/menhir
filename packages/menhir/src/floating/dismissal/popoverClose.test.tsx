import { createSignal, flush } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createRenderer, isJSDOM, screen } from "#test-utils";

import { Popover } from "../../../test/floating/dismissal/Popover.tsx";
import {
  centerOf,
  keyboard,
  nextTask,
  press,
} from "../../../test/floating/dismissal/input.ts";
import { trackListeners } from "../../../test/floating/dismissal/listeners.ts";

function popoverNamed(name = "Popover") {
  return screen.getByTestId(name);
}

function isShowing(name = "Popover") {
  return popoverNamed(name).matches(":popover-open");
}

/** The reasons `onOpenChange` was called with, and the open state. */
function reasons(onOpenChange: ReturnType<typeof vi.fn>) {
  return onOpenChange.mock.calls.map(([open, details]) => [
    open,
    details?.reason,
  ]);
}

/** A point on the page, below the trigger and away from the popover. */
const outside = { x: 5, y: 300 };

describe("createPopoverClose", () => {
  const { render } = createRenderer();
  afterEach(() => vi.restoreAllMocks());

  it.skipIf(isJSDOM)(
    "reports Escape as escape-key with the key event",
    async () => {
      const onOpenChange = vi.fn();
      await render(() => <Popover defaultOpen onOpenChange={onOpenChange} />);
      expect(isShowing()).toBe(true);

      await keyboard("{Escape}");
      await nextTask();

      expect(isShowing()).toBe(false);
      expect(onOpenChange).toHaveBeenCalledOnce();
      const [open, details] = onOpenChange.mock.calls[0]!;
      expect(open).toBe(false);
      expect(details.reason).toBe("escape-key");
      expect(details.event.key).toBe("Escape");
      expect(popoverNamed()).not.toHaveAttribute("data-open");
    },
  );

  it.skipIf(isJSDOM)("reports a press outside as outside-press", async () => {
    const onOpenChange = vi.fn();
    await render(() => <Popover defaultOpen onOpenChange={onOpenChange} />);

    await press(outside);
    await nextTask();

    expect(isShowing()).toBe(false);
    expect(reasons(onOpenChange)).toEqual([[false, "outside-press"]]);
    expect(onOpenChange.mock.calls[0]![1].event).toBeInstanceOf(PointerEvent);
  });

  it.skipIf(isJSDOM)(
    "reports a press on the trigger as trigger-press, and does not reopen",
    async () => {
      const onOpenChange = vi.fn();
      await render(() => <Popover defaultOpen onOpenChange={onOpenChange} />);

      await press(
        centerOf(screen.getByRole("button", { name: "Popover trigger" })),
      );
      await nextTask();

      expect(isShowing()).toBe(false);
      expect(reasons(onOpenChange)).toEqual([[false, "trigger-press"]]);
    },
  );

  it.skipIf(isJSDOM)(
    "reports Enter on the trigger as trigger-press",
    async () => {
      const onOpenChange = vi.fn();
      await render(() => <Popover defaultOpen onOpenChange={onOpenChange} />);
      screen.getByRole("button", { name: "Popover trigger" }).focus();

      await keyboard("{Enter}");
      await nextTask();

      expect(isShowing()).toBe(false);
      expect(reasons(onOpenChange)).toEqual([[false, "trigger-press"]]);
    },
  );

  it.skipIf(isJSDOM)("does not close on a press inside", async () => {
    const onOpenChange = vi.fn();
    await render(() => <Popover defaultOpen onOpenChange={onOpenChange} />);

    await press(
      centerOf(screen.getByRole("button", { name: "Inside Popover" })),
    );
    await nextTask();

    expect(isShowing()).toBe(true);
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it.skipIf(isJSDOM)("does not close when focus leaves it", async () => {
    const onOpenChange = vi.fn();
    await render(() => (
      <>
        <Popover defaultOpen onOpenChange={onOpenChange} />
        <button type="button">After</button>
      </>
    ));
    screen.getByRole("button", { name: "Inside Popover" }).focus();

    await keyboard("{Tab}");
    await nextTask();

    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "After" }),
    );
    expect(isShowing()).toBe(true);
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  // The browser's close cannot be refused: `beforetoggle` is not cancelable
  // on close.
  it.skipIf(isJSDOM)(
    "shows a controlled popover that keeps open again, and reports the close once",
    async () => {
      const onOpenChange = vi.fn();
      await render(() => <Popover open onOpenChange={onOpenChange} />);

      await keyboard("{Escape}");
      await nextTask();

      expect(reasons(onOpenChange)).toEqual([[false, "escape-key"]]);
      expect(isShowing()).toBe(true);
    },
  );

  it.skipIf(isJSDOM)(
    "reports nothing when the popup closes itself",
    async () => {
      const onOpenChange = vi.fn();
      const [open, setOpen] = createSignal(true);
      await render(() => <Popover open={open()} onOpenChange={onOpenChange} />);

      setOpen(false);
      flush();
      await nextTask();

      expect(isShowing()).toBe(false);
      expect(onOpenChange).not.toHaveBeenCalled();
    },
  );

  it.skipIf(isJSDOM)(
    "reports a close with no key or press, such as another popover opening, as close-request",
    async () => {
      const onOpenChange = vi.fn();
      await render(() => (
        <>
          <Popover label="First" defaultOpen onOpenChange={onOpenChange} />
          <Popover label="Second" />
        </>
      ));

      popoverNamed("Second").showPopover();
      await nextTask();

      expect(isShowing("First")).toBe(false);
      expect(reasons(onOpenChange)).toEqual([[false, "close-request"]]);
    },
  );

  // Only a pointer counts as a press outside: a key fires `click` too.
  it.skipIf(isJSDOM)(
    "reports Enter on another popover's trigger as close-request",
    async () => {
      const onOpenChange = vi.fn();
      await render(() => (
        <>
          <Popover label="First" defaultOpen onOpenChange={onOpenChange} />
          <Popover label="Second" />
        </>
      ));
      screen.getByRole("button", { name: "Second trigger" }).focus();

      await keyboard("{Enter}");
      await nextTask();

      expect(isShowing("Second")).toBe(true);
      expect(isShowing("First")).toBe(false);
      expect(reasons(onOpenChange)).toEqual([[false, "close-request"]]);
    },
  );

  it.skipIf(isJSDOM)(
    "does not blame a later close on an Escape that closed nothing",
    async () => {
      const onOpenChange = vi.fn();
      await render(() => (
        <>
          <input
            aria-label="Search"
            onKeyDown={(event) => {
              if (event.key === "Escape") event.preventDefault();
            }}
          />
          <Popover label="First" defaultOpen onOpenChange={onOpenChange}>
            <input
              aria-label="Inside search"
              onKeyDown={(event) => event.preventDefault()}
            />
          </Popover>
          <Popover label="Second" />
        </>
      ));
      screen.getByRole("textbox", { name: "Inside search" }).focus();

      // Handled inside the popover, so the browser closes nothing.
      await keyboard("{Escape}");
      await nextTask();
      expect(isShowing("First")).toBe(true);
      popoverNamed("Second").showPopover();
      await nextTask();

      expect(reasons(onOpenChange)).toEqual([[false, "close-request"]]);
    },
  );

  it.skipIf(isJSDOM)(
    "closes the topmost of nested popovers, one per Escape",
    async () => {
      const onOuterChange = vi.fn();
      const { user } = await render(() => (
        <Popover label="Outer" defaultOpen onOpenChange={onOuterChange}>
          <Popover label="Inner" />
        </Popover>
      ));
      await user.click(screen.getByRole("button", { name: "Inner trigger" }));
      expect(isShowing("Inner")).toBe(true);

      await keyboard("{Escape}");
      await nextTask();
      expect(isShowing("Inner")).toBe(false);
      expect(isShowing("Outer")).toBe(true);
      expect(onOuterChange).not.toHaveBeenCalled();

      await keyboard("{Escape}");
      await nextTask();
      expect(isShowing("Outer")).toBe(false);
      expect(reasons(onOuterChange)).toEqual([[false, "escape-key"]]);
    },
  );

  it("listens only while open, and stops on close and on disposal", async () => {
    const listeners = trackListeners();
    const [open, setOpen] = createSignal(false);
    const { unmount } = await render(() => <Popover open={open()} />);
    listeners.mark();

    setOpen(true);
    flush();
    expect(listeners.added()).not.toEqual([]);

    setOpen(false);
    flush();
    expect(listeners.added()).toEqual([]);

    setOpen(true);
    flush();
    unmount();
    expect(listeners.added()).toEqual([]);
  });
});
