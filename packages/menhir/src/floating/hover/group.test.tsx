import { createSignal, flush, Show } from "solid-js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { afterFlush, createRenderer, isJSDOM } from "#test-utils";

import {
  away,
  enter,
  isOpen,
  leave,
  trigger,
  wait,
} from "../../../test/floating/hover/helpers.ts";
import { Tooltip } from "../../../test/floating/hover/Tooltip.tsx";
import { centerOf, line, movePointer } from "../../../test/floating/input.ts";
import { createHoverGroup } from "./group.ts";

describe("createHoverGroup", () => {
  const { render } = createRenderer();
  beforeEach(async () => {
    if (!isJSDOM) await movePointer([away]);
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("opens another member at once while one is open, and closes the first with the second's pointerenter", async () => {
    const group = createHoverGroup();
    const onFirstChange = vi.fn();
    await render(() => (
      <>
        <Tooltip label="First" group={group} onOpenChange={onFirstChange} />
        <Tooltip label="Second" group={group} />
      </>
    ));
    enter(trigger("First"));
    await wait(600);
    expect(isOpen("First")).toBe(true);
    onFirstChange.mockClear();

    // Straight onto the second, as when the triggers touch.
    enter(trigger("Second"));
    await afterFlush();

    expect(isOpen("Second")).toBe(true);
    expect(isOpen("First")).toBe(false);
    expect(onFirstChange).toHaveBeenCalledExactlyOnceWith(false, {
      reason: "trigger-hover",
      event: expect.objectContaining({
        type: "pointerenter",
        target: trigger("Second"),
      }),
    });
  });

  it("opens the next at once within `timeout` of the last closing, and after it waits the delay", async () => {
    const group = createHoverGroup({ timeout: 300 });
    await render(() => (
      <>
        <Tooltip label="First" group={group} />
        <Tooltip label="Second" group={group} />
      </>
    ));
    enter(trigger("First"));
    await wait(600);
    leave(trigger("First"));
    await wait(299);
    expect(isOpen("First")).toBe(false);

    enter(trigger("Second"));
    await afterFlush();
    expect(isOpen("Second")).toBe(true);

    leave(trigger("Second"));
    await wait(300);
    enter(trigger("First"));
    await wait(599);
    expect(isOpen("First")).toBe(false);
    await wait(1);
    expect(isOpen("First")).toBe(true);
  });

  it("keeps the group open for 400 ms by default", async () => {
    const group = createHoverGroup();
    await render(() => (
      <>
        <Tooltip label="First" group={group} />
        <Tooltip label="Second" group={group} />
      </>
    ));
    enter(trigger("First"));
    await wait(600);
    leave(trigger("First"));
    await wait(400);

    enter(trigger("Second"));
    await afterFlush();

    expect(isOpen("Second")).toBe(false);
  });

  it.skipIf(isJSDOM)(
    "opens each at once as the pointer moves straight from one trigger to the next",
    async () => {
      const group = createHoverGroup();
      await render(() => (
        <div style={{ display: "flex", gap: "10px" }}>
          <Tooltip label="First" group={group} />
          <Tooltip label="Second" group={group} />
          <Tooltip label="Third" group={group} />
        </div>
      ));
      await movePointer([centerOf(trigger("First"))]);
      await wait(600);
      expect(isOpen("First")).toBe(true);

      await movePointer(
        line(centerOf(trigger("First")), centerOf(trigger("Second"))),
      );
      await afterFlush();
      expect(isOpen("First")).toBe(false);
      expect(isOpen("Second")).toBe(true);

      await movePointer(
        line(centerOf(trigger("Second")), centerOf(trigger("Third"))),
      );
      await afterFlush();
      expect(isOpen("Second")).toBe(false);
      expect(isOpen("Third")).toBe(true);
    },
  );

  it("gives its `delay` to members without one, and a member's own wins", async () => {
    const group = createHoverGroup({ delay: 200 });
    await render(() => (
      <>
        <Tooltip label="Grouped" group={group} />
        <Tooltip label="Own" group={group} delay={800} />
      </>
    ));

    enter(trigger("Grouped"));
    await wait(199);
    expect(isOpen("Grouped")).toBe(false);
    await wait(1);
    expect(isOpen("Grouped")).toBe(true);

    leave(trigger("Grouped"));
    await wait(1000);
    enter(trigger("Own"));
    await wait(799);
    expect(isOpen("Own")).toBe(false);
    await wait(1);
    expect(isOpen("Own")).toBe(true);
  });

  it("does not share between two groups", async () => {
    const first = createHoverGroup();
    const second = createHoverGroup();
    await render(() => (
      <>
        <Tooltip label="First" group={first} />
        <Tooltip label="Second" group={second} />
      </>
    ));
    enter(trigger("First"));
    await wait(600);

    enter(trigger("Second"));
    await afterFlush();
    expect(isOpen("Second")).toBe(false);
    expect(isOpen("First")).toBe(true);
    await wait(600);
    expect(isOpen("Second")).toBe(true);
  });

  it("is neither opened nor kept open by a popup opened another way", async () => {
    const group = createHoverGroup();
    const [open, setOpen] = createSignal(false);
    await render(() => (
      <>
        <Tooltip label="First" group={group} open={open()} />
        <Tooltip label="Second" group={group} />
      </>
    ));

    // Opened by focus, say.
    setOpen(true);
    flush();
    enter(trigger("Second"));
    await afterFlush();
    expect(isOpen("Second")).toBe(false);
    expect(isOpen("First")).toBe(true);

    leave(trigger("Second"));
    setOpen(false);
    flush();
    enter(trigger("Second"));
    await afterFlush();
    expect(isOpen("Second")).toBe(false);
  });

  it("lets go of a member disposed while open: the next waits its delay, and nothing reaches the disposed one", async () => {
    const group = createHoverGroup();
    const [shown, setShown] = createSignal(true);
    const onFirstChange = vi.fn();
    await render(() => (
      <>
        <Show when={shown()}>
          <Tooltip label="First" group={group} onOpenChange={onFirstChange} />
        </Show>
        <Tooltip label="Second" group={group} />
      </>
    ));
    enter(trigger("First"));
    await wait(600);
    onFirstChange.mockClear();

    setShown(false);
    flush();
    await wait(1000);
    enter(trigger("Second"));
    await afterFlush();

    expect(isOpen("Second")).toBe(false);
    expect(onFirstChange).not.toHaveBeenCalled();
    await wait(600);
    expect(isOpen("Second")).toBe(true);
  });
});
