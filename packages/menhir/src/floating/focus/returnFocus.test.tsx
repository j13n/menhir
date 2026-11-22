import { createSignal, flush } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createRenderer, isJSDOM, screen } from "#test-utils";

import { Dialog } from "../../../test/floating/focus/Dialog.tsx";
import { Popover } from "../../../test/floating/focus/Popover.tsx";
import {
  centerOf,
  keyboard,
  nextTask,
  press,
} from "../../../test/floating/input.ts";
import { trackListeners } from "../../../test/floating/listeners.ts";

function button(name: string) {
  return screen.getByRole("button", { name });
}

describe("createReturnFocus", () => {
  const { render } = createRenderer();
  afterEach(() => vi.restoreAllMocks());

  it.skipIf(isJSDOM)(
    "leaves it to the browser without returnFocus: a dialog returns focus to the element focused before",
    async () => {
      const { user } = await render(() => <Dialog />);

      await user.click(button("Dialog trigger"));
      await user.click(button("Close Dialog"));

      expect(document.activeElement).toBe(button("Dialog trigger"));
    },
  );

  it.skipIf(isJSDOM)(
    "moves focus to returnFocus, an element, once the dialog has closed",
    async () => {
      let heading!: HTMLHeadingElement;
      const { user } = await render(() => (
        <>
          <h1 ref={(el) => (heading = el)} tabindex="-1">
            Page
          </h1>
          <Dialog returnFocus={heading} />
        </>
      ));

      await user.click(button("Dialog trigger"));
      await user.click(button("Close Dialog"));

      expect(document.activeElement).toBe(
        screen.getByRole("heading", { name: "Page" }),
      );
    },
  );

  it.skipIf(isJSDOM)(
    "reads returnFocus, a function, when the dialog closes",
    async () => {
      const target = vi.fn(() => button("Other"));
      const { user } = await render(() => (
        <>
          <button>Other</button>
          <Dialog returnFocus={target} />
        </>
      ));

      await user.click(button("Dialog trigger"));
      expect(target).not.toHaveBeenCalled();
      await user.click(button("Close Dialog"));

      expect(target).toHaveBeenCalledOnce();
      expect(document.activeElement).toBe(button("Other"));
    },
  );

  it.skipIf(isJSDOM)(
    "leaves focus on the body when the element focused before is gone",
    async () => {
      const [open, setOpen] = createSignal(false);
      const { user } = await render(() => (
        <Dialog open={open()} onOpenChange={setOpen} />
      ));
      const focusedBefore = document.createElement("button");
      document.body.append(focusedBefore);
      focusedBefore.focus();
      setOpen(true);
      flush();
      focusedBefore.remove();

      await user.click(button("Close Dialog"));
      await nextTask();

      expect(document.activeElement).toBe(document.body);
    },
  );

  it.skipIf(isJSDOM)(
    "hands a returnFocus function the element the browser focused, or null when it is gone",
    async () => {
      const [open, setOpen] = createSignal(false);
      const returnFocus = vi.fn(
        (browsers: Element | null) =>
          (browsers as HTMLElement | null) ?? button("Fallback"),
      );
      const { user } = await render(() => (
        <>
          <button>Fallback</button>
          <button>Kept</button>
          <Dialog
            open={open()}
            onOpenChange={setOpen}
            returnFocus={returnFocus}
          />
        </>
      ));

      button("Kept").focus();
      setOpen(true);
      flush();
      await user.click(button("Close Dialog"));
      await nextTask();
      expect(returnFocus).toHaveBeenLastCalledWith(button("Kept"));
      expect(document.activeElement).toBe(button("Kept"));

      const focusedBefore = document.createElement("button");
      document.body.append(focusedBefore);
      focusedBefore.focus();
      setOpen(true);
      flush();
      focusedBefore.remove();
      await user.click(button("Close Dialog"));
      await nextTask();
      expect(returnFocus).toHaveBeenLastCalledWith(null);
      expect(document.activeElement).toBe(button("Fallback"));
    },
  );

  it.skipIf(isJSDOM)(
    "returns focus from a dialog opened from code to what was focused, or to returnFocus",
    async () => {
      const [open, setOpen] = createSignal(false);
      const [target, setTarget] = createSignal<HTMLElement>();
      const { user } = await render(() => (
        <>
          <button>Save</button>
          <button>Done</button>
          <Dialog open={open()} onOpenChange={setOpen} returnFocus={target()} />
        </>
      ));
      // A save that opens the dialog once it has finished.
      button("Save").focus();
      setOpen(true);
      flush();
      await user.click(button("Close Dialog"));
      await nextTask();
      expect(document.activeElement).toBe(button("Save"));

      setTarget(button("Done"));
      button("Save").focus();
      setOpen(true);
      flush();
      await user.click(button("Close Dialog"));
      await nextTask();
      expect(document.activeElement).toBe(button("Done"));
    },
  );

  it.skipIf(isJSDOM)(
    "moves focus to returnFocus when a popover closes on Escape",
    async () => {
      const { user } = await render(() => (
        <>
          <button>Elsewhere</button>
          <Popover returnFocus={() => button("Elsewhere")}>
            <button>Inside</button>
          </Popover>
        </>
      ));
      await user.click(button("Popover trigger"));
      button("Inside").focus();

      await keyboard("{Escape}");
      await nextTask();

      expect(screen.getByTestId("Popover").matches(":popover-open")).toBe(
        false,
      );
      expect(document.activeElement).toBe(button("Elsewhere"));
    },
  );

  it.skipIf(isJSDOM)(
    "leaves focus on another button whose press closed a popover",
    async () => {
      const { user } = await render(() => (
        <>
          <button>Elsewhere</button>
          <button>Pressed</button>
          <Popover returnFocus={() => button("Elsewhere")}>
            <button>Inside</button>
          </Popover>
        </>
      ));
      await user.click(button("Popover trigger"));
      button("Inside").focus();

      await press(centerOf(button("Pressed")));
      await nextTask();

      expect(screen.getByTestId("Popover").matches(":popover-open")).toBe(
        false,
      );
      expect(document.activeElement).toBe(button("Pressed"));
    },
  );

  it.skipIf(isJSDOM)(
    "returns focus once a popup still shown after its state turned false has closed",
    async () => {
      let close: (() => void) | undefined;
      const { user } = await render(() => (
        <>
          <button>Elsewhere</button>
          <Dialog
            returnFocus={() => button("Elsewhere")}
            deferClose={(c) => (close = c)}
          />
        </>
      ));
      await user.click(button("Dialog trigger"));

      await user.click(button("Close Dialog"));
      await nextTask();
      // Still shown, so still modal: focus has not moved.
      expect(screen.getByTestId("Dialog").matches(":modal")).toBe(true);
      expect(document.activeElement).toBe(button("Close Dialog"));

      close!();
      await nextTask();
      expect(document.activeElement).toBe(button("Elsewhere"));
    },
  );

  it.skipIf(isJSDOM)(
    "moves no focus when the popup is disposed while open",
    async () => {
      const target = vi.fn(() => button("Elsewhere"));
      const [shown, setShown] = createSignal(true);
      const { user } = await render(() => (
        <>
          <button>Elsewhere</button>
          {shown() && <Dialog returnFocus={target} />}
        </>
      ));
      await user.click(button("Dialog trigger"));

      setShown(false);
      flush();
      await nextTask();

      expect(target).not.toHaveBeenCalled();
    },
  );

  it("listens only while open, and stops once closed and on disposal", async () => {
    const listeners = trackListeners();
    const [open, setOpen] = createSignal(false);
    const { unmount } = await render(() => (
      <Dialog open={open()} wrap={false} />
    ));
    listeners.mark();

    setOpen(true);
    flush();
    expect(listeners.added()).not.toEqual([]);

    setOpen(false);
    flush();
    await nextTask();
    expect(listeners.added()).toEqual([]);

    setOpen(true);
    flush();
    unmount();
    expect(listeners.added()).toEqual([]);
  });
});
