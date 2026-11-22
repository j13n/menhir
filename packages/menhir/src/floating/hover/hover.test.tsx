import { createSignal, flush, Show } from "solid-js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  afterFlush,
  createRenderer,
  fireEvent,
  isJSDOM,
  screen,
} from "#test-utils";

import {
  away,
  enter,
  isOpen,
  leave,
  trigger,
  wait,
} from "../../../test/floating/hover/helpers.ts";
import { Tooltip } from "../../../test/floating/hover/Tooltip.tsx";
import {
  centerOf,
  line,
  movePointer,
  tap,
} from "../../../test/floating/input.ts";
import { trackListeners } from "../../../test/floating/listeners.ts";

/** Opens the tooltip by resting a real mouse on its trigger. */
async function hoverOpen(name = "Tooltip") {
  await movePointer([centerOf(trigger(name))]);
  await wait(600);
  expect(isOpen(name)).toBe(true);
}

describe("createHover", () => {
  const { render } = createRenderer();
  beforeEach(async () => {
    // Out of the way of the elements a test renders.
    if (!isJSDOM) await movePointer([away]);
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("opens after 600 ms of a mouse on the trigger, and reports trigger-hover with the pointerenter", async () => {
    const onOpenChange = vi.fn();
    await render(() => <Tooltip onOpenChange={onOpenChange} />);

    fireEvent.pointerEnter(trigger(), { pointerType: "mouse" });
    await wait(599);
    expect(isOpen()).toBe(false);
    await wait(1);

    expect(isOpen()).toBe(true);
    expect(onOpenChange).toHaveBeenCalledOnce();
    const [open, details] = onOpenChange.mock.calls[0]!;
    expect(open).toBe(true);
    expect(details.reason).toBe("trigger-hover");
    expect(details.event).toMatchObject({
      type: "pointerenter",
      pointerType: "mouse",
    });
  });

  it("opens after `delay` instead, and at once with 0", async () => {
    await render(() => (
      <>
        <Tooltip label="Slow" delay={1000} />
        <Tooltip label="Instant" delay={0} />
      </>
    ));

    enter(trigger("Instant"));
    await afterFlush();
    expect(isOpen("Instant")).toBe(true);

    enter(trigger("Slow"));
    await wait(999);
    expect(isOpen("Slow")).toBe(false);
    await wait(1);
    expect(isOpen("Slow")).toBe(true);
  });

  it("opens nothing when the pointer leaves before the delay ends", async () => {
    const onOpenChange = vi.fn();
    await render(() => <Tooltip onOpenChange={onOpenChange} />);

    enter(trigger());
    await wait(300);
    leave(trigger());
    await wait(1000);

    expect(onOpenChange).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("closes at once when the pointer leaves, and reports trigger-hover with the event", async () => {
    const onOpenChange = vi.fn();
    await render(() => <Tooltip delay={0} onOpenChange={onOpenChange} />);
    enter(trigger());
    await afterFlush();
    onOpenChange.mockClear();

    leave(trigger());
    await afterFlush();

    expect(isOpen()).toBe(false);
    expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false, {
      reason: "trigger-hover",
      event: expect.objectContaining({ type: "pointermove" }),
    });
  });

  it("stays open for `closeDelay`, and stays open when the pointer comes back within it", async () => {
    await render(() => <Tooltip delay={0} closeDelay={300} />);
    enter(trigger());
    await afterFlush();

    leave(trigger());
    await wait(299);
    expect(isOpen()).toBe(true);
    enter(trigger());
    await wait(1000);
    expect(isOpen()).toBe(true);

    leave(trigger());
    await wait(299);
    expect(isOpen()).toBe(true);
    await wait(1);
    expect(isOpen()).toBe(false);
  });

  it.skipIf(isJSDOM)(
    "stays open while the pointer crosses the gap from the trigger to the popup, and back",
    async () => {
      await render(() => <Tooltip />);
      await hoverOpen();
      const popup = screen.getByTestId("Tooltip");

      await movePointer(line(centerOf(trigger()), centerOf(popup)));
      await wait(1000);
      expect(isOpen()).toBe(true);

      await movePointer(line(centerOf(popup), centerOf(trigger())));
      await wait(1000);
      expect(isOpen()).toBe(true);
    },
  );

  it.skipIf(isJSDOM)(
    "stays open while the pointer stops in the gap",
    async () => {
      await render(() => <Tooltip />);
      await hoverOpen();
      const { x, y } = centerOf(trigger());
      const top = screen.getByTestId("Tooltip").getBoundingClientRect().top;

      // Halfway down the gap.
      await movePointer(line({ x, y }, { x, y: top - 10 }, 5));
      await wait(5000);

      expect(isOpen()).toBe(true);
    },
  );

  it.skipIf(isJSDOM)(
    "closes when the pointer leaves the trigger away from the popup",
    async () => {
      await render(() => <Tooltip />);
      await hoverOpen();
      const { x, y } = centerOf(trigger());

      // Up, and the popup is below.
      await movePointer(line({ x, y }, { x, y: y - 40 }, 5));
      await afterFlush();

      expect(isOpen()).toBe(false);
    },
  );

  it.skipIf(isJSDOM)(
    "closes when the pointer leaves the popup away from the trigger",
    async () => {
      await render(() => <Tooltip />);
      await hoverOpen();
      const popup = screen.getByTestId("Tooltip");
      await movePointer(line(centerOf(trigger()), centerOf(popup)));
      const { x, y } = centerOf(popup);

      // Down, and the trigger is above.
      await movePointer(line({ x, y }, { x, y: y + 60 }, 5));
      await afterFlush();

      expect(isOpen()).toBe(false);
    },
  );

  it("closes for nothing while the pointer rests on the trigger or the popup", async () => {
    await render(() => <Tooltip delay={0} />);
    enter(trigger());
    await wait(60_000);
    expect(isOpen()).toBe(true);

    fireEvent.pointerLeave(trigger(), {
      pointerType: "mouse",
      clientX: 20,
      clientY: 20,
      relatedTarget: screen.getByTestId("Tooltip"),
    });
    enter(screen.getByTestId("Tooltip"));
    await wait(60_000);
    expect(isOpen()).toBe(true);
  });

  it("does not open again once closed while the pointer is on the trigger, until it leaves and comes back", async () => {
    const [open, setOpen] = createSignal(false);
    await render(() => (
      <Tooltip open={open()} onOpenChange={setOpen} delay={0} />
    ));
    enter(trigger());
    flush();
    expect(isOpen()).toBe(true);

    // Dismissed, as by Escape.
    setOpen(false);
    flush();
    fireEvent.pointerMove(trigger(), { pointerType: "mouse", clientX: 30 });
    await wait(1000);
    expect(isOpen()).toBe(false);

    leave(trigger());
    enter(trigger());
    flush();
    expect(isOpen()).toBe(true);
  });

  it("closes a popup opened another way once the pointer enters and leaves", async () => {
    const onOpenChange = vi.fn();
    await render(() => <Tooltip defaultOpen onOpenChange={onOpenChange} />);
    await wait(1000);
    expect(isOpen()).toBe(true);

    enter(trigger());
    await wait(1000);
    expect(onOpenChange).not.toHaveBeenCalled();
    leave(trigger());
    await afterFlush();

    expect(isOpen()).toBe(false);
  });

  it("opens nothing on a touch, nor on the mouse events emulated after it", async () => {
    const onOpenChange = vi.fn();
    await render(() => <Tooltip onOpenChange={onOpenChange} />);
    const button = trigger();

    fireEvent.pointerEnter(button, { pointerType: "touch" });
    fireEvent.pointerDown(button, { pointerType: "touch" });
    fireEvent.pointerUp(button, { pointerType: "touch" });
    fireEvent.pointerLeave(button, { pointerType: "touch" });
    fireEvent.mouseEnter(button);
    fireEvent.mouseMove(button);
    fireEvent.click(button);
    await wait(1000);

    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it.skipIf(isJSDOM)("opens nothing on a real tap", async () => {
    const onOpenChange = vi.fn();
    await render(() => <Tooltip onOpenChange={onOpenChange} />);

    await tap(centerOf(trigger()));
    await wait(1000);

    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("opens on a pen that rests on the trigger, and closes when it leaves", async () => {
    await render(() => <Tooltip />);

    enter(trigger(), "pen");
    await wait(600);
    expect(isOpen()).toBe(true);
    leave(trigger(), "pen");
    await afterFlush();
    expect(isOpen()).toBe(false);
  });

  it.skipIf(isJSDOM)("opens on a real pen that hovers", async () => {
    await render(() => <Tooltip />);

    await movePointer([centerOf(trigger())], "pen");
    await wait(600);

    expect(isOpen()).toBe(true);
  });

  it.skipIf(isJSDOM)(
    "closes when the pointer leaves the window from the trigger or the popup",
    async () => {
      await render(() => <Tooltip />);
      await hoverOpen();

      await movePointer([{ x: -5, y: -5 }]);
      await afterFlush();
      expect(isOpen()).toBe(false);

      await hoverOpen();
      const popup = screen.getByTestId("Tooltip");
      await movePointer(line(centerOf(trigger()), centerOf(popup)));
      await movePointer([{ x: -5, y: -5 }]);
      await afterFlush();
      expect(isOpen()).toBe(false);
    },
  );

  it.skipIf(isJSDOM)(
    "closes when the page scrolls under a still pointer",
    async () => {
      document.body.style.height = "3000px";
      try {
        await render(() => <Tooltip />);
        await hoverOpen();

        scrollBy(0, 200);

        // The browser fires the boundary events of a still pointer a
        // while after the scroll, on its own clock.
        await vi.waitFor(() => expect(isOpen()).toBe(false));
      } finally {
        document.body.style.height = "";
        scrollTo(0, 0);
      }
    },
  );

  it("opens nothing once disabled while the delay is pending, nor on hover while disabled, and still closes", async () => {
    const [disabled, setDisabled] = createSignal(false);
    const onOpenChange = vi.fn();
    await render(() => (
      <Tooltip disabled={disabled()} onOpenChange={onOpenChange} />
    ));

    enter(trigger());
    await wait(300);
    setDisabled(true);
    flush();
    await wait(1000);
    leave(trigger());
    enter(trigger());
    await wait(1000);
    expect(onOpenChange).not.toHaveBeenCalled();

    setDisabled(false);
    flush();
    enter(trigger());
    await wait(600);
    expect(isOpen()).toBe(true);
    setDisabled(true);
    flush();
    leave(trigger());
    await afterFlush();
    expect(isOpen()).toBe(false);
  });

  it("opens nothing when the trigger is removed while the delay is pending", async () => {
    const [shown, setShown] = createSignal(true);
    const onOpenChange = vi.fn();
    await render(() => (
      <Show when={shown()}>
        <Tooltip onOpenChange={onOpenChange} />
      </Show>
    ));
    enter(trigger());
    await wait(300);

    setShown(false);
    flush();
    await wait(1000);

    expect(onOpenChange).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("opens nothing when the trigger leaves the document while the delay is pending", async () => {
    const onOpenChange = vi.fn();
    await render(() => <Tooltip onOpenChange={onOpenChange} />);
    const button = trigger();
    enter(button);
    await wait(300);

    // Moved out by something other than Solid, which disposes nothing.
    button.remove();
    await wait(1000);

    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it.skipIf(isJSDOM)(
    "closes the first and waits the second's delay when the pointer moves straight from one trigger to another",
    async () => {
      await render(() => (
        <div style={{ display: "flex", gap: "10px" }}>
          <Tooltip label="First" />
          <Tooltip label="Second" />
        </div>
      ));
      await hoverOpen("First");

      await movePointer(
        line(centerOf(trigger("First")), centerOf(trigger("Second"))),
      );
      await afterFlush();
      expect(isOpen("First")).toBe(false);
      expect(isOpen("Second")).toBe(false);

      await wait(600);
      expect(isOpen("Second")).toBe(true);
    },
  );

  it("clears a pending delay when `open` changes elsewhere", async () => {
    const [open, setOpen] = createSignal(false);
    const onOpenChange = vi.fn();
    await render(() => (
      <Tooltip open={open()} onOpenChange={onOpenChange} closeDelay={300} />
    ));

    enter(trigger());
    await wait(300);
    // Opened by focus, say.
    setOpen(true);
    flush();
    await wait(1000);
    expect(onOpenChange).not.toHaveBeenCalled();

    leave(trigger());
    await wait(100);
    // Closed by Escape, say.
    setOpen(false);
    flush();
    await wait(1000);
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("listens on the trigger from mount to disposal, and on the popup and the document only while open", async () => {
    const listeners = trackListeners();
    listeners.mark();
    const { unmount } = await render(() => <Tooltip delay={0} />);
    const onTrigger = ["pointerenter", "pointerleave", "pointermove"];
    expect(listeners.added()).toEqual(onTrigger);

    enter(trigger());
    await afterFlush();
    expect(listeners.added()).toEqual([...onTrigger, ...onTrigger].sort());
    // The pointer crossing towards the popup.
    fireEvent.pointerLeave(trigger(), {
      pointerType: "mouse",
      clientX: 20,
      clientY: 20,
      relatedTarget: document.body,
    });
    expect(listeners.added()).toEqual(
      [...onTrigger, ...onTrigger, "pointermove", "pointerout"].sort(),
    );

    unmount();
    expect(listeners.added()).toEqual([]);
  });
});
