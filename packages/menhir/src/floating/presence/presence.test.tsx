import { createSignal, flush, Show } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createRenderer, isJSDOM, screen } from "#test-utils";

import { keyboard, nextTask } from "../../../test/floating/input.ts";
import { Dialog } from "../../../test/floating/presence/Dialog.tsx";
import { Popover } from "../../../test/floating/presence/Popover.tsx";

const shown = (element: Element) => element.matches("[open], :popover-open");

// Exits long enough never to end by themselves: a test ends them with
// `finish()`, so nothing waits on the clock.
const css = `
  .fade { transition: opacity 10s; }
  .fade[data-closed] { opacity: 0; }
  .instant { transition: opacity 0s; }
  .instant[data-closed] { opacity: 0; }
  @media (prefers-reduced-motion: reduce) { .fade { transition: none; } }
  @starting-style { .entry[data-open] { opacity: 0; } }
  .keyframes[data-closed] { animation: out 10s; }
  .backdrop::backdrop { transition: opacity 10s; }
  .backdrop[data-closed]::backdrop { opacity: 0; }
  .child[data-closed] p { animation: out 10s; }
  .delayed[data-closed] { animation: out 1s 10s; }
  .spinner p { animation: out 1s infinite; }
  .paused p { animation: out 10s paused; }
  @keyframes out { to { opacity: 0; } }
`;

/** The animations running in the popup, its subtree and pseudo-elements. */
const running = (element: Element) =>
  element
    .getAnimations({ subtree: true })
    .filter((animation) => animation.playState === "running");

/** Ends the running animations, and waits for the popup to see it. */
async function finishAll(element: Element) {
  for (const animation of running(element)) animation.finish();
  await nextTask();
}

describe("createPresence", () => {
  const { render } = createRenderer();
  let style: HTMLStyleElement | undefined;
  afterEach(() => style?.remove());
  const addStyles = () => {
    style = document.head.appendChild(document.createElement("style"));
    style.textContent = css;
  };

  it("shows nothing while closed", async () => {
    await render(() => (
      <>
        <Dialog />
        <Popover />
      </>
    ));

    expect(shown(screen.getByTestId("Dialog"))).toBe(false);
    expect(shown(screen.getByTestId("Popover"))).toBe(false);
  });

  it.skipIf(isJSDOM)(
    "opening shows a dialog as modal, and a popover",
    async () => {
      const [open, setOpen] = createSignal(false);
      await render(() => (
        <>
          <Dialog open={open()} />
          <Popover open={open()} />
        </>
      ));

      setOpen(true);
      flush();

      expect(screen.getByTestId("Dialog").matches(":modal")).toBe(true);
      expect(screen.getByTestId("Popover").matches(":popover-open")).toBe(true);
    },
  );

  it.skipIf(isJSDOM)("a dialog open at mount is modal", async () => {
    await render(() => <Dialog defaultOpen />);

    expect(screen.getByTestId("Dialog").matches(":modal")).toBe(true);
  });

  it.skipIf(isJSDOM)(
    "leaves a popover the browser has shown as it is",
    async () => {
      const { user } = await render(() => <Popover />);
      const popover = screen.getByTestId("Popover");

      await user.click(screen.getByRole("button", { name: "Popover trigger" }));

      expect(popover.matches(":popover-open")).toBe(true);
      expect(popover).toHaveAttribute("data-open");
    },
  );

  it.skipIf(isJSDOM)(
    "with nothing running, closing hides the popup in the same flush",
    async () => {
      const [open, setOpen] = createSignal(true);
      await render(() => (
        <>
          <Dialog open={open()} />
          <Popover open={open()} />
        </>
      ));

      setOpen(false);
      flush();

      expect(shown(screen.getByTestId("Dialog"))).toBe(false);
      expect(shown(screen.getByTestId("Popover"))).toBe(false);
    },
  );

  it.skipIf(isJSDOM)(
    "an exit transition keeps the dialog modal until it has ended, then closes it",
    async () => {
      addStyles();
      const [open, setOpen] = createSignal(true);
      await render(() => <Dialog open={open()} class="fade" />);
      const dialog = screen.getByTestId("Dialog");
      let closes = 0;
      dialog.addEventListener("close", () => closes++);
      const closed = new Promise((resolve) =>
        dialog.addEventListener("close", resolve),
      );

      setOpen(false);
      flush();
      await nextTask();

      expect(dialog.matches(":modal")).toBe(true);
      expect(running(dialog)).toHaveLength(1);

      await finishAll(dialog);

      expect(shown(dialog)).toBe(false);
      // The browser fires `close` in a later task.
      await closed;
      await nextTask();
      expect(closes).toBe(1);
    },
  );

  it.skipIf(isJSDOM)(
    "a popover is hidden once its exit transition has ended",
    async () => {
      addStyles();
      const [open, setOpen] = createSignal(true);
      await render(() => <Popover open={open()} class="fade" />);
      const popover = screen.getByTestId("Popover");

      setOpen(false);
      flush();
      await nextTask();

      expect(popover.matches(":popover-open")).toBe(true);

      await finishAll(popover);

      expect(popover.matches(":popover-open")).toBe(false);
    },
  );

  it.skipIf(isJSDOM).each([
    ["an exit @keyframes animation", "keyframes"],
    ["a transition on the ::backdrop", "backdrop"],
    ["an animation on a child", "child"],
    ["an animation with a delay", "delayed"],
  ])("waits for %s", async (_, className) => {
    addStyles();
    const [open, setOpen] = createSignal(true);
    await render(() => (
      <Dialog open={open()} class={className}>
        <p>Content</p>
      </Dialog>
    ));
    const dialog = screen.getByTestId("Dialog");

    setOpen(false);
    flush();
    await nextTask();

    expect(dialog.matches(":modal")).toBe(true);

    await finishAll(dialog);

    expect(shown(dialog)).toBe(false);
  });

  it.skipIf(isJSDOM)(
    "waits for an animation started during the exit",
    async () => {
      addStyles();
      const [open, setOpen] = createSignal(true);
      await render(() => <Dialog open={open()} class="fade" />);
      const dialog = screen.getByTestId("Dialog");

      setOpen(false);
      flush();
      const [exit] = running(dialog);
      const later = dialog.animate({ scale: [1, 0.9] }, 10_000);
      exit!.finish();
      await nextTask();

      expect(dialog.matches(":modal")).toBe(true);

      later.finish();
      await nextTask();

      expect(shown(dialog)).toBe(false);
    },
  );

  it.skipIf(isJSDOM).each([
    ["an infinite animation", "spinner"],
    ["a paused animation", "paused"],
  ])("does not wait for %s", async (_, className) => {
    addStyles();
    const [open, setOpen] = createSignal(true);
    await render(() => (
      <Dialog open={open()} class={className}>
        <p>Content</p>
      </Dialog>
    ));
    const dialog = screen.getByTestId("Dialog");
    expect(dialog.getAnimations({ subtree: true })).toHaveLength(1);

    setOpen(false);
    flush();

    expect(shown(dialog)).toBe(false);
  });

  it.skipIf(isJSDOM)(
    "opening again while it leaves cancels the exit",
    async () => {
      addStyles();
      const [open, setOpen] = createSignal(true);
      await render(() => <Dialog open={open()} class="fade" />);
      const dialog = screen.getByTestId("Dialog");
      await finishAll(dialog);

      setOpen(false);
      flush();
      setOpen(true);
      flush();
      await finishAll(dialog);

      expect(dialog.matches(":modal")).toBe(true);
      expect(dialog.inert).toBe(false);
    },
  );

  it.skipIf(isJSDOM)(
    "closing while it opens turns the entry back, and closes once that has ended",
    async () => {
      addStyles();
      const [open, setOpen] = createSignal(false);
      await render(() => <Dialog open={open()} class="fade entry" />);
      const dialog = screen.getByTestId("Dialog");

      setOpen(true);
      flush();
      const [entry] = running(dialog);
      // Halfway: a transition turned back at its start would take no time.
      entry!.currentTime = 5000;
      setOpen(false);
      flush();

      expect(entry!.playState).toBe("idle");
      expect(dialog.matches(":modal")).toBe(true);

      await finishAll(dialog);

      expect(shown(dialog)).toBe(false);
    },
  );

  it.skipIf(isJSDOM)(
    "while it leaves, the dialog is inert, and focus returns once it has closed",
    async () => {
      addStyles();
      const [open, setOpen] = createSignal(false);
      const { user } = await render(() => (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            Open
          </button>
          <Dialog open={open()} class="fade" />
        </>
      ));
      const dialog = screen.getByTestId("Dialog");
      const opener = screen.getByRole("button", { name: "Open" });
      await user.click(opener);
      await finishAll(dialog);
      expect(dialog.contains(document.activeElement)).toBe(true);

      setOpen(false);
      flush();

      expect(dialog.inert).toBe(true);
      expect(dialog.matches(":modal")).toBe(true);

      await finishAll(dialog);

      expect(dialog.inert).toBe(false);
      expect(document.activeElement).toBe(opener);
    },
  );

  it.skipIf(isJSDOM)(
    "a popover without focus is inert while it leaves; one with focus is not, and focus returns to its trigger",
    async () => {
      addStyles();
      const { user } = await render(() => <Popover class="fade" />);
      const popover = screen.getByTestId("Popover");
      const trigger = screen.getByRole("button", { name: "Popover trigger" });

      await user.click(trigger);
      await finishAll(popover);
      const close = screen.getByRole("button", { name: "Close Popover" });
      trigger.blur();
      // A press outside the popup, from code: the browser does not hide it.
      close.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      flush();
      await nextTask();

      expect(popover.inert).toBe(true);
      await finishAll(popover);
      expect(popover.matches(":popover-open")).toBe(false);
      expect(popover.inert).toBe(false);

      await user.click(trigger);
      await finishAll(popover);
      await user.click(close);
      await nextTask();

      expect(popover.inert).toBe(false);
      await finishAll(popover);
      expect(document.activeElement).toBe(trigger);
    },
  );

  it.skipIf(isJSDOM)("puts the popup's own inert back", async () => {
    addStyles();
    const [open, setOpen] = createSignal(true);
    await render(() => <Dialog open={open()} class="fade" inert />);
    const dialog = screen.getByTestId("Dialog");
    await finishAll(dialog);

    setOpen(false);
    flush();
    await finishAll(dialog);

    expect(dialog.inert).toBe(true);
  });

  describe.skipIf(isJSDOM)("ends the exit", () => {
    it("with a zero duration", async () => {
      addStyles();
      const [open, setOpen] = createSignal(true);
      await render(() => <Dialog open={open()} class="instant" />);

      setOpen(false);
      flush();

      expect(shown(screen.getByTestId("Dialog"))).toBe(false);
    });

    it("with prefers-reduced-motion, when the CSS drops the transition for it", async () => {
      addStyles();
      const { cdp } = await import("vitest/browser");
      const session = cdp();
      await session.send("Emulation.setEmulatedMedia", {
        features: [{ name: "prefers-reduced-motion", value: "reduce" }],
      });
      try {
        const [open, setOpen] = createSignal(true);
        await render(() => <Dialog open={open()} class="fade" />);

        setOpen(false);
        flush();

        expect(shown(screen.getByTestId("Dialog"))).toBe(false);
      } finally {
        await session.send("Emulation.setEmulatedMedia", { features: [] });
      }
    });

    it("when the animation is cancelled", async () => {
      addStyles();
      const [open, setOpen] = createSignal(true);
      await render(() => <Dialog open={open()} class="keyframes" />);
      const dialog = screen.getByTestId("Dialog");

      setOpen(false);
      flush();
      for (const animation of running(dialog)) animation.cancel();
      await nextTask();

      expect(shown(dialog)).toBe(false);
    });

    it("inside a display: none ancestor, at once", async () => {
      addStyles();
      const [open, setOpen] = createSignal(true);
      await render(() => (
        <div style={{ display: "none" }}>
          <Dialog open={open()} class="keyframes" />
        </div>
      ));

      setOpen(false);
      flush();

      expect(shown(screen.getByTestId("Dialog"))).toBe(false);
    });

    it("when an ancestor is hidden during the exit", async () => {
      addStyles();
      const [open, setOpen] = createSignal(true);
      await render(() => (
        <div data-testid="ancestor">
          <Dialog open={open()} class="keyframes" />
        </div>
      ));
      const dialog = screen.getByTestId("Dialog");

      setOpen(false);
      flush();
      expect(dialog.matches(":modal")).toBe(true);
      screen.getByTestId("ancestor").style.display = "none";
      await nextTask();

      expect(shown(dialog)).toBe(false);
    });

    it("when Escape closes the dialog first, and nothing happens after", async () => {
      addStyles();
      const [open, setOpen] = createSignal(true);
      const onOpenChange = vi.fn();
      await render(() => (
        <Dialog open={open()} class="keyframes" onOpenChange={onOpenChange} />
      ));
      const dialog = screen.getByTestId("Dialog");
      let closes = 0;
      dialog.addEventListener("close", () => closes++);

      setOpen(false);
      flush();
      await keyboard("{Escape}");
      await nextTask();

      expect(shown(dialog)).toBe(false);
      expect(dialog.inert).toBe(false);
      expect(running(dialog)).toEqual([]);
      expect(closes).toBe(1);
      expect(onOpenChange).not.toHaveBeenCalled();
    });
  });

  it.skipIf(isJSDOM)(
    "removed while it leaves, it is out of the top layer, and the wait ends",
    async () => {
      addStyles();
      const [open, setOpen] = createSignal(true);
      const [mounted, setMounted] = createSignal(true);
      await render(() => (
        <Show when={mounted()}>
          <Dialog open={open()} class="keyframes" />
        </Show>
      ));
      const dialog = screen.getByTestId("Dialog") as HTMLDialogElement;

      setOpen(false);
      flush();
      expect(dialog.matches(":modal")).toBe(true);
      setMounted(false);
      flush();
      await nextTask();

      expect(dialog.isConnected).toBe(false);
      expect(dialog.matches(":modal")).toBe(false);
      expect(dialog.open).toBe(false);
    },
  );

  it.skipIf(isJSDOM)(
    "with dismissal and the scroll lock, Escape runs the exit, and focus returns and the page unlocks once it has closed",
    async () => {
      addStyles();
      const onOpenChange = vi.fn();
      const { user } = await render(() => (
        <Dialog class="fade" lock onOpenChange={onOpenChange} />
      ));
      const dialog = screen.getByTestId("Dialog");
      const trigger = screen.getByRole("button", { name: "Dialog trigger" });
      const html = document.documentElement;
      await user.click(trigger);
      await finishAll(dialog);

      await keyboard("{Escape}");
      await nextTask();

      const reported = () =>
        onOpenChange.mock.calls.map(([open, details]) => [
          open,
          details?.reason,
        ]);
      expect(reported()).toEqual([
        [true, "trigger-press"],
        [false, "escape-key"],
      ]);
      expect(dialog.matches(":modal")).toBe(true);
      expect(html.style.overflowY).toBe("hidden");
      expect(document.activeElement).not.toBe(trigger);

      await finishAll(dialog);
      await nextTask();

      expect(shown(dialog)).toBe(false);
      expect(reported()).toHaveLength(2);
      expect(html.style.overflowY).toBe("");
      expect(document.activeElement).toBe(trigger);
    },
  );
});
