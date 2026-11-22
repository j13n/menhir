import { createSignal, flush } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createRenderer, isJSDOM, screen } from "#test-utils";

import { Dialog } from "../../../test/floating/dismissal/Dialog.tsx";
import { keyboard, nextTask } from "../../../test/floating/dismissal/input.ts";
import { trackListeners } from "../../../test/floating/dismissal/listeners.ts";

function dialogNamed(name = "Dialog") {
  return screen.getByRole<HTMLDialogElement>("dialog", { name, hidden: true });
}

describe("createDialogClose", () => {
  const { render } = createRenderer();
  afterEach(() => vi.restoreAllMocks());

  it.skipIf(isJSDOM)(
    "reports Escape as escape-key with the key event, and the dialog closes",
    async () => {
      const onOpenChange = vi.fn();
      await render(() => <Dialog defaultOpen onOpenChange={onOpenChange} />);
      const dialog = dialogNamed();
      expect(dialog.matches(":modal")).toBe(true);

      await keyboard("{Escape}");
      await nextTask();

      expect(dialog.open).toBe(false);
      expect(onOpenChange).toHaveBeenCalledOnce();
      const [open, details] = onOpenChange.mock.calls[0]!;
      expect(open).toBe(false);
      expect(details.reason).toBe("escape-key");
      expect(details.event).toBeInstanceOf(KeyboardEvent);
      expect(details.event.key).toBe("Escape");
    },
  );

  it.skipIf(isJSDOM)(
    "keeps a controlled dialog open and modal on the first Escape",
    async () => {
      const onOpenChange = vi.fn();
      await render(() => <Dialog open onOpenChange={onOpenChange} />);
      const dialog = dialogNamed();

      await keyboard("{Escape}");
      await nextTask();

      expect(
        onOpenChange.mock.calls.map(([open, d]) => [open, d.reason]),
      ).toEqual([[false, "escape-key"]]);
      expect(dialog.matches(":modal")).toBe(true);
    },
  );

  // `cancel` is cancelable only with history-action activation, so the
  // browser closes the dialog on the second Escape anyway.
  it.skipIf(isJSDOM)(
    "reports the second Escape once, and opens the dialog again",
    async () => {
      const onOpenChange = vi.fn();
      await render(() => <Dialog open onOpenChange={onOpenChange} />);
      const dialog = dialogNamed();
      const closes = vi.fn();
      dialog.addEventListener("close", closes);

      await keyboard("{Escape}");
      await nextTask();
      await keyboard("{Escape}");
      await nextTask();

      // The browser did close it: the case is real, not a prevented cancel.
      expect(closes).toHaveBeenCalledOnce();
      expect(
        onOpenChange.mock.calls.map(([open, d]) => [open, d.reason]),
      ).toEqual([
        [false, "escape-key"],
        [false, "escape-key"],
      ]);
      await vi.waitFor(() => expect(dialog.matches(":modal")).toBe(true));
    },
  );

  it.skipIf(isJSDOM)(
    "reports a close by a form as close-request, and the dialog closes",
    async () => {
      const onOpenChange = vi.fn();
      const { user } = await render(() => (
        <Dialog defaultOpen onOpenChange={onOpenChange}>
          <form method="dialog">
            <button>Done</button>
          </form>
        </Dialog>
      ));
      const dialog = dialogNamed();

      await user.click(screen.getByRole("button", { name: "Done" }));
      await nextTask();

      expect(dialog.open).toBe(false);
      expect(onOpenChange).toHaveBeenCalledOnce();
      const [open, details] = onOpenChange.mock.calls[0]!;
      expect(open).toBe(false);
      expect(details.reason).toBe("close-request");
      expect(details.event.type).toBe("close");
      // Opens again: the state followed the browser.
      await user.click(screen.getByRole("button", { name: "Dialog trigger" }));
      expect(dialog.matches(":modal")).toBe(true);
    },
  );

  it.skipIf(isJSDOM)(
    "reports nothing when the popup closes itself",
    async () => {
      const onOpenChange = vi.fn();
      const [open, setOpen] = createSignal(true);
      await render(() => <Dialog open={open()} onOpenChange={onOpenChange} />);
      const dialog = dialogNamed();

      setOpen(false);
      flush();
      await nextTask();

      expect(dialog.open).toBe(false);
      expect(onOpenChange).not.toHaveBeenCalled();
    },
  );

  it.skipIf(isJSDOM)(
    "closes the topmost of nested dialogs, one per Escape",
    async () => {
      await render(() => (
        <Dialog label="Outer" defaultOpen>
          <Dialog label="Inner" defaultOpen />
        </Dialog>
      ));
      const outer = dialogNamed("Outer");
      const inner = dialogNamed("Inner");
      expect(inner.matches(":modal")).toBe(true);

      await keyboard("{Escape}");
      await nextTask();
      expect(inner.open).toBe(false);
      expect(outer.matches(":modal")).toBe(true);

      await keyboard("{Escape}");
      await nextTask();
      expect(outer.open).toBe(false);
    },
  );

  it("listens only while open, and stops on close and on disposal", async () => {
    const listeners = trackListeners();
    const [open, setOpen] = createSignal(false);
    const { unmount } = await render(() => <Dialog open={open()} />);
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
