// The test list and the cases left out are in ../README.md.
import { flush } from "solid-js";
import { describe, expect, it, vi } from "vitest";

import { afterFlush, createRenderer, isJSDOM, screen } from "#test-utils";

import { centerOf } from "../../../test/floating/input.ts";
import { dragTo, hold, moved, release } from "../../../test/toast/drag.ts";
import {
  Notifications,
  rendered,
  toast,
} from "../../../test/toast/Notifications.tsx";
import type { TestData } from "../../../test/toast/Notifications.tsx";
import { createToastManager, Toast } from "../index.ts";
import type { SwipeOptions } from "./swipe.ts";

// Real pointer input and pointer capture: jsdom has neither.
describe.skipIf(isJSDOM)("Toast.swipe", () => {
  const { render } = createRenderer();

  async function setup(options?: SwipeOptions) {
    const toasts = createToastManager<TestData>();
    const onOpenChange = vi.fn();
    const id = toasts.add({ title: "Saved", duration: Infinity, onOpenChange });
    await render(() => (
      <Notifications
        toasts={toasts}
        regionStyle={{
          inset: "100px auto auto 200px",
          margin: 0,
          width: "300px",
        }}
        rootRef={Toast.swipe(options)}
      />
    ));
    const start = centerOf(toast(id));
    return { id, onOpenChange, start };
  }

  const settle = async () => {
    flush();
    await afterFlush();
    flush();
  };

  it("closes the toast on a drag past the threshold, reporting swipe", async () => {
    const { id, onOpenChange, start } = await setup();
    const element = toast(id);
    await hold(start);
    await dragTo(moved(start, 20), moved(start, 60));
    await release(moved(start, 60));

    expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false, {
      reason: "swipe",
      event: expect.objectContaining({ type: "pointerup" }),
    });
    expect(element).toHaveAttribute("data-swipe", "end");
    expect(element).toHaveAttribute("data-swipe-direction", "right");
    await settle();
    expect(rendered()).toEqual([]);
  });

  it("has data-swipe and the distance while dragging", async () => {
    const { id, start } = await setup();
    await hold(start);
    expect(toast(id)).not.toHaveAttribute("data-swipe");
    await dragTo(moved(start, 20, 7));

    expect(toast(id)).toHaveAttribute("data-swipe", "move");
    expect(toast(id).style.getPropertyValue("--toast-swipe-x")).toBe("20px");
    // Not a direction it takes.
    expect(toast(id).style.getPropertyValue("--toast-swipe-y")).toBe("0px");
    await release(moved(start, 20, 7));
  });

  it("stays open when released before the threshold, with the attributes removed", async () => {
    const { id, onOpenChange, start } = await setup();
    await hold(start);
    await dragTo(moved(start, 49));
    await release(moved(start, 49));

    expect(onOpenChange).not.toHaveBeenCalled();
    expect(toast(id)).not.toHaveAttribute("data-swipe");
    expect(toast(id)).not.toHaveAttribute("data-swipe-direction");
    expect(toast(id).style.getPropertyValue("--toast-swipe-x")).toBe("");
    expect(toast(id).style.getPropertyValue("--toast-swipe-y")).toBe("");
    expect(rendered()).toEqual([id]);
  });

  it("does not move or close on a drag the other way", async () => {
    const { id, onOpenChange, start } = await setup();
    await hold(start);
    await dragTo(moved(start, -80));
    expect(toast(id).style.getPropertyValue("--toast-swipe-x")).toBe("0px");
    await release(moved(start, -80));

    expect(onOpenChange).not.toHaveBeenCalled();
    expect(rendered()).toEqual([id]);
  });

  it("takes a threshold and several directions", async () => {
    const { id, onOpenChange, start } = await setup({
      direction: ["left", "up"],
      threshold: 10,
    });
    const element = toast(id);
    await hold(start);
    await dragTo(moved(start, -4, -12));
    expect(toast(id).style.getPropertyValue("--toast-swipe-x")).toBe("-4px");
    expect(toast(id).style.getPropertyValue("--toast-swipe-y")).toBe("-12px");
    await release(moved(start, -4, -12));

    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(element).toHaveAttribute("data-swipe-direction", "up");
  });

  it("leaves a press that shakes a little a click on the button under it", async () => {
    const { id, onOpenChange } = await setup();
    const close = centerOf(screen.getByRole("button", { name: `Close ${id}` }));
    await hold(close);
    await dragTo(moved(close, 2, 1));
    expect(toast(id)).not.toHaveAttribute("data-swipe");
    await release(moved(close, 2, 1));

    expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false, {
      reason: "close-press",
      event: expect.objectContaining({ type: "click" }),
    });
  });

  it("does not click the button a swipe started on, and clicks it on a press", async () => {
    const { id, onOpenChange, start } = await setup();
    const close = centerOf(screen.getByRole("button", { name: `Close ${id}` }));
    await hold(close);
    await dragTo(moved(close, 20));
    await release(moved(close, 20));
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(start).toBeDefined();

    await hold(close);
    await release(close);
    expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false, {
      reason: "close-press",
      event: expect.objectContaining({ type: "click" }),
    });
  });
});
