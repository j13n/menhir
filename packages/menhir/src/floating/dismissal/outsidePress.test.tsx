import { createSignal, flush } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createRenderer, isJSDOM, screen } from "#test-utils";

import { Dialog } from "../../../test/floating/dismissal/Dialog.tsx";
import {
  centerOf,
  nextTask,
  press,
  tap,
  touchScroll,
} from "../../../test/floating/dismissal/input.ts";
import { trackListeners } from "../../../test/floating/dismissal/listeners.ts";

function dialogNamed(name = "Dialog") {
  return screen.getByRole<HTMLDialogElement>("dialog", { name, hidden: true });
}

/** A point on the backdrop, near the viewport's top left corner. */
const backdrop = { x: 5, y: 5 };

/** A dialog 200 by 120 with 20px of padding, centered by the browser. */
const dialogStyle = { width: "200px", height: "120px", padding: "20px" };

describe("createOutsidePress", () => {
  const { render } = createRenderer();
  afterEach(() => vi.restoreAllMocks());

  it.skipIf(isJSDOM)(
    "reports a press on the backdrop as outside-press with the click, and the dialog closes",
    async () => {
      const onOpenChange = vi.fn();
      await render(() => (
        <Dialog
          defaultOpen
          outsidePress
          onOpenChange={onOpenChange}
          style={dialogStyle}
        />
      ));
      const dialog = dialogNamed();

      await press(backdrop);
      await nextTask();

      expect(dialog.open).toBe(false);
      expect(onOpenChange).toHaveBeenCalledOnce();
      const [open, details] = onOpenChange.mock.calls[0]!;
      expect(open).toBe(false);
      expect(details.reason).toBe("outside-press");
      expect(details.event.type).toBe("click");
    },
  );

  it.skipIf(isJSDOM)(
    "does not close on a press inside, or on the dialog's padding",
    async () => {
      const onOpenChange = vi.fn();
      await render(() => (
        <Dialog
          defaultOpen
          outsidePress
          onOpenChange={onOpenChange}
          style={dialogStyle}
        />
      ));
      const dialog = dialogNamed();
      const { left, top } = dialog.getBoundingClientRect();

      await press(
        centerOf(screen.getByRole("button", { name: "Inside Dialog" })),
      );
      // The padding's target is the <dialog> itself, as the backdrop's is.
      await press({ x: left + 5, y: top + 5 });
      await nextTask();

      expect(dialog.open).toBe(true);
      expect(onOpenChange).not.toHaveBeenCalled();
    },
  );

  it.skipIf(isJSDOM)(
    "does not close on a press that starts inside and ends on the backdrop",
    async () => {
      const onOpenChange = vi.fn();
      await render(() => (
        <Dialog
          defaultOpen
          outsidePress
          onOpenChange={onOpenChange}
          style={dialogStyle}
        >
          <p>Some text to select</p>
        </Dialog>
      ));

      await press(centerOf(screen.getByText("Some text to select")), backdrop);
      await nextTask();

      expect(dialogNamed().open).toBe(true);
      expect(onOpenChange).not.toHaveBeenCalled();
    },
  );

  it.skipIf(isJSDOM)(
    "does not close on a press that starts on the backdrop and ends inside",
    async () => {
      const onOpenChange = vi.fn();
      await render(() => (
        <Dialog
          defaultOpen
          outsidePress
          onOpenChange={onOpenChange}
          style={dialogStyle}
        />
      ));

      await press(
        backdrop,
        centerOf(screen.getByRole("button", { name: "Inside Dialog" })),
      );
      await nextTask();

      expect(dialogNamed().open).toBe(true);
      expect(onOpenChange).not.toHaveBeenCalled();
    },
  );

  it.skipIf(isJSDOM)(
    "closes on a press where the trigger is, under the backdrop, and does not reopen",
    async () => {
      const onOpenChange = vi.fn();
      await render(() => (
        <Dialog
          defaultOpen
          outsidePress
          onOpenChange={onOpenChange}
          style={dialogStyle}
          triggerStyle={{ position: "fixed", left: "0", top: "0" }}
        />
      ));
      const dialog = dialogNamed();
      const trigger = screen.getByRole("button", {
        name: "Dialog trigger",
        hidden: true,
      });

      await press(centerOf(trigger));
      await nextTask();

      expect(dialog.open).toBe(false);
      expect(
        onOpenChange.mock.calls.map(([open, d]) => [open, d.reason]),
      ).toEqual([[false, "outside-press"]]);
    },
  );

  it.skipIf(isJSDOM)(
    "does not close on a secondary-button press on the backdrop",
    async () => {
      const onOpenChange = vi.fn();
      await render(() => (
        <Dialog
          defaultOpen
          outsidePress
          onOpenChange={onOpenChange}
          style={dialogStyle}
        />
      ));

      await press(backdrop, backdrop, "right");
      await press(backdrop, backdrop, "middle");
      await nextTask();

      expect(dialogNamed().open).toBe(true);
      expect(onOpenChange).not.toHaveBeenCalled();
    },
  );

  it.skipIf(isJSDOM)(
    "does not close on a press on the dialog's own scrollbar",
    async () => {
      const onOpenChange = vi.fn();
      await render(() => (
        <Dialog
          defaultOpen
          outsidePress
          onOpenChange={onOpenChange}
          style={{ ...dialogStyle, padding: "0", overflow: "scroll" }}
        >
          <div style={{ height: "1000px" }} />
        </Dialog>
      ));
      const dialog = dialogNamed();
      // The dialog has a classic scrollbar: its content box is narrower.
      expect(dialog.clientWidth).toBeLessThan(dialog.offsetWidth);
      const { right, top, height } = dialog.getBoundingClientRect();

      await press({ x: right - 3, y: top + height / 2 });
      await nextTask();

      expect(dialog.open).toBe(true);
      expect(onOpenChange).not.toHaveBeenCalled();
    },
  );

  it.skipIf(isJSDOM)(
    "does not close on a touch on the backdrop that scrolls the page, and closes on a tap",
    async () => {
      const onOpenChange = vi.fn();
      await render(() => (
        <>
          <div style={{ height: "5000px" }} />
          <Dialog
            defaultOpen
            outsidePress
            onOpenChange={onOpenChange}
            style={dialogStyle}
          />
        </>
      ));
      const dialog = dialogNamed();
      const point = { x: 20, y: window.innerHeight - 40 };

      await touchScroll(point);
      await nextTask();
      // The page did scroll: the gesture was a scroll, not a tap.
      expect(window.scrollY).toBeGreaterThan(0);
      expect(dialog.open).toBe(true);
      expect(onOpenChange).not.toHaveBeenCalled();

      await tap(point);
      await nextTask();
      expect(dialog.open).toBe(false);
      window.scrollTo(0, 0);
    },
  );

  it.skipIf(isJSDOM)(
    "does not close on a press in an iframe inside the dialog",
    async () => {
      const onOpenChange = vi.fn();
      await render(() => (
        <Dialog
          defaultOpen
          outsidePress
          onOpenChange={onOpenChange}
          style={dialogStyle}
        >
          <iframe title="Frame" srcdoc="<button>In the frame</button>" />
        </Dialog>
      ));
      const frame = screen.getByTitle("Frame");
      await vi.waitFor(() =>
        expect((frame as HTMLIFrameElement).contentDocument?.readyState).toBe(
          "complete",
        ),
      );

      await press(centerOf(frame));
      await nextTask();

      expect(document.activeElement).toBe(frame);
      expect(dialogNamed().open).toBe(true);
      expect(onOpenChange).not.toHaveBeenCalled();
    },
  );

  it.skipIf(isJSDOM)("closes the topmost of nested dialogs only", async () => {
    const onOuterChange = vi.fn();
    await render(() => (
      <Dialog
        label="Outer"
        defaultOpen
        outsidePress
        onOpenChange={onOuterChange}
        style={dialogStyle}
      >
        <Dialog label="Inner" defaultOpen outsidePress style={dialogStyle} />
      </Dialog>
    ));
    const outer = dialogNamed("Outer");
    const inner = dialogNamed("Inner");

    await press(backdrop);
    await nextTask();

    expect(inner.open).toBe(false);
    expect(outer.matches(":modal")).toBe(true);
    expect(onOuterChange).not.toHaveBeenCalled();
  });

  it("listens only while open, and stops on close and on disposal", async () => {
    const listeners = trackListeners();
    const [open, setOpen] = createSignal(false);
    const { unmount } = await render(() => (
      <Dialog open={open()} outsidePress />
    ));
    listeners.mark();

    setOpen(true);
    flush();
    expect(listeners.added()).toEqual(
      expect.arrayContaining(["click", "pointerdown"]),
    );

    setOpen(false);
    flush();
    expect(listeners.added()).toEqual([]);

    setOpen(true);
    flush();
    unmount();
    expect(listeners.added()).toEqual([]);
  });
});
