import { createSignal, flush } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createRenderer, fireEvent, isJSDOM, screen } from "#test-utils";

import { Dialog } from "../../../test/floating/dismissal/Dialog.tsx";
import { keyboard, nextTask } from "../../../test/floating/dismissal/input.ts";
import { trackListeners } from "../../../test/floating/dismissal/listeners.ts";
import { Popover } from "../../../test/floating/dismissal/Popover.tsx";
import { Tooltip } from "../../../test/floating/dismissal/Tooltip.tsx";

/** Whether the test tooltip of that name is open, by its state. */
function isOpen(name = "Tooltip") {
  return screen.getByTestId(name).hasAttribute("data-open");
}

describe("createEscape", () => {
  const { render } = createRenderer();
  afterEach(() => vi.restoreAllMocks());

  it("reports Escape as escape-key with the key event, and the tooltip closes", async () => {
    const onOpenChange = vi.fn();
    await render(() => <Tooltip defaultOpen onOpenChange={onOpenChange} />);
    expect(isOpen()).toBe(true);

    fireEvent.keyDown(document.body, { key: "Escape" });

    await vi.waitFor(() => expect(isOpen()).toBe(false));
    expect(onOpenChange).toHaveBeenCalledOnce();
    const [open, details] = onOpenChange.mock.calls[0]!;
    expect(open).toBe(false);
    expect(details.reason).toBe("escape-key");
    expect(details.event).toBeInstanceOf(KeyboardEvent);
    expect(details.event.key).toBe("Escape");
  });

  it("does nothing on other keys", async () => {
    const onOpenChange = vi.fn();
    await render(() => <Tooltip defaultOpen onOpenChange={onOpenChange} />);

    fireEvent.keyDown(document.body, { key: "Enter" });
    fireEvent.keyDown(document.body, { key: "Esc" });

    expect(isOpen()).toBe(true);
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("does nothing while closed", async () => {
    const onOpenChange = vi.fn();
    await render(() => <Tooltip onOpenChange={onOpenChange} />);

    fireEvent.keyDown(document.body, { key: "Escape" });

    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("does nothing while an input method is composing", async () => {
    const onOpenChange = vi.fn();
    await render(() => <Tooltip defaultOpen onOpenChange={onOpenChange} />);

    fireEvent.keyDown(document.body, { key: "Escape", isComposing: true });

    expect(isOpen()).toBe(true);
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("does nothing on a key already handled", async () => {
    const onOpenChange = vi.fn();
    await render(() => (
      <>
        <input
          aria-label="Search"
          onKeyDown={(event) => event.preventDefault()}
        />
        <Tooltip defaultOpen onOpenChange={onOpenChange} />
      </>
    ));

    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Escape" });

    expect(isOpen()).toBe(true);
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("marks the key handled, and lets it carry on to the page's listeners", async () => {
    const seen = vi.fn((event: KeyboardEvent) => event.defaultPrevented);
    window.addEventListener("keydown", seen);
    try {
      await render(() => <Tooltip defaultOpen />);

      const notCanceled = fireEvent.keyDown(document.body, { key: "Escape" });

      expect(notCanceled).toBe(false);
      expect(seen).toHaveReturnedWith(true);
    } finally {
      window.removeEventListener("keydown", seen);
    }
  });

  it("closes the tooltip opened last, then the other", async () => {
    const [second, setSecond] = createSignal(false);
    await render(() => (
      <>
        <Tooltip label="Second" open={second()} onOpenChange={setSecond} />
        <Tooltip label="First" defaultOpen />
      </>
    ));
    // Opened after the first, though it comes first in the document.
    setSecond(true);
    flush();
    expect(isOpen("First")).toBe(true);

    fireEvent.keyDown(document.body, { key: "Escape" });
    await vi.waitFor(() => expect(isOpen("Second")).toBe(false));
    expect(isOpen("First")).toBe(true);

    fireEvent.keyDown(document.body, { key: "Escape" });
    await vi.waitFor(() => expect(isOpen("First")).toBe(false));
  });

  it.skipIf(isJSDOM)(
    "keeps a dialog below the tooltip open, and the next Escape closes it",
    async () => {
      await render(() => (
        <Dialog defaultOpen>
          <Tooltip defaultOpen />
        </Dialog>
      ));
      const dialog = screen.getByRole<HTMLDialogElement>("dialog", {
        name: "Dialog",
      });

      await keyboard("{Escape}");
      await nextTask();
      expect(isOpen()).toBe(false);
      expect(dialog.matches(":modal")).toBe(true);

      await keyboard("{Escape}");
      await nextTask();
      expect(dialog.open).toBe(false);
    },
  );

  it.skipIf(isJSDOM)(
    "keeps a popover below the tooltip open, and the next Escape closes it",
    async () => {
      await render(() => (
        <Popover defaultOpen>
          <Tooltip defaultOpen />
        </Popover>
      ));
      const popover = screen.getByTestId("Popover");

      await keyboard("{Escape}");
      await nextTask();
      expect(isOpen()).toBe(false);
      expect(popover.matches(":popover-open")).toBe(true);

      await keyboard("{Escape}");
      await nextTask();
      expect(popover.matches(":popover-open")).toBe(false);
    },
  );

  it("listens only while open, and stops on close and on disposal", async () => {
    const listeners = trackListeners();
    const [open, setOpen] = createSignal(false);
    const { unmount } = await render(() => <Tooltip open={open()} />);
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
