import { createSignal, flush } from "solid-js";
import { describe, expect, it, vi } from "vitest";

import { createRenderer, isJSDOM, screen } from "#test-utils";

import { Dialog } from "../../../test/floating/focus/Dialog.tsx";
import { Popover } from "../../../test/floating/focus/Popover.tsx";

// Without initialFocus the browser decides, and `autofocus` steers it. These
// tests pin what the popups rely on.
describe("initial focus by the browser", () => {
  const { render } = createRenderer();

  it.skipIf(isJSDOM)("is the dialog's first focusable element", async () => {
    const { user } = await render(() => (
      <Dialog>
        <p>Text</p>
        <button>First</button>
      </Dialog>
    ));

    await user.click(screen.getByRole("button", { name: "Dialog trigger" }));

    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "First" }),
    );
  });

  it.skipIf(isJSDOM)(
    "is the element inside a dialog with autofocus, also a static one",
    async () => {
      const { user } = await render(() => (
        <>
          <Dialog label="Confirm">
            <button>Delete</button>
            <button autofocus>Keep</button>
          </Dialog>
          <Dialog label="Terms">
            <h2 tabindex="-1" autofocus>
              Terms
            </h2>
            <button>Accept</button>
          </Dialog>
        </>
      ));

      await user.click(screen.getByRole("button", { name: "Confirm trigger" }));
      expect(document.activeElement).toBe(
        screen.getByRole("button", { name: "Keep" }),
      );
      await user.click(screen.getByRole("button", { name: "Close Confirm" }));

      await user.click(screen.getByRole("button", { name: "Terms trigger" }));
      expect(document.activeElement).toBe(
        screen.getByRole("heading", { name: "Terms" }),
      );
    },
  );

  it.skipIf(isJSDOM)(
    "is the element inside a popover with autofocus; without one, focus stays on the trigger",
    async () => {
      const { user } = await render(() => (
        <>
          <Popover label="Menu">
            <button>Cut</button>
            <button autofocus>Copy</button>
          </Popover>
          <Popover label="Info">
            <button>Details</button>
          </Popover>
        </>
      ));

      await user.click(screen.getByRole("button", { name: "Menu trigger" }));
      expect(document.activeElement).toBe(
        screen.getByRole("button", { name: "Copy" }),
      );

      const info = screen.getByRole("button", { name: "Info trigger" });
      await user.click(info);
      expect(screen.getByTestId("Info").matches(":popover-open")).toBe(true);
      expect(document.activeElement).toBe(info);
    },
  );
});

describe("createInitialFocus", () => {
  const { render } = createRenderer();

  it.skipIf(isJSDOM)(
    "moves focus to initialFocus, an element, once the dialog opens",
    async () => {
      const [target, setTarget] = createSignal<HTMLElement>();
      const { user } = await render(() => (
        <Dialog initialFocus={target()}>
          <button>First</button>
          <input aria-label="Search" />
        </Dialog>
      ));
      setTarget(screen.getByRole("textbox", { name: "Search", hidden: true }));
      flush();

      await user.click(screen.getByRole("button", { name: "Dialog trigger" }));

      // In a microtask after the flush that opened it.
      await vi.waitFor(() =>
        expect(document.activeElement).toBe(
          screen.getByRole("textbox", { name: "Search" }),
        ),
      );
    },
  );

  // A ref inside the popup is assigned after the popup's props are read.
  it.skipIf(isJSDOM)(
    "takes a ref inside the popup through a function",
    async () => {
      let field: HTMLInputElement | undefined;
      const { user } = await render(() => (
        <Dialog initialFocus={() => field}>
          <button>First</button>
          <input ref={(el) => (field = el)} aria-label="Search" />
        </Dialog>
      ));

      await user.click(screen.getByRole("button", { name: "Dialog trigger" }));

      await vi.waitFor(() =>
        expect(document.activeElement).toBe(
          screen.getByRole("textbox", { name: "Search" }),
        ),
      );
    },
  );

  it.skipIf(isJSDOM)(
    "calls initialFocus, a function, on each opening with the element the browser focused",
    async () => {
      const initialFocus = vi.fn(() => undefined);
      const { user } = await render(() => (
        <Dialog initialFocus={initialFocus}>
          <button>First</button>
          <button autofocus>Second</button>
        </Dialog>
      ));
      expect(initialFocus).not.toHaveBeenCalled();

      await user.click(screen.getByRole("button", { name: "Dialog trigger" }));
      await vi.waitFor(() => expect(initialFocus).toHaveBeenCalledOnce());
      // Returning undefined keeps the browser's choice.
      expect(initialFocus).toHaveBeenLastCalledWith(
        screen.getByRole("button", { name: "Second" }),
      );
      expect(document.activeElement).toBe(
        screen.getByRole("button", { name: "Second" }),
      );

      await user.click(screen.getByRole("button", { name: "Close Dialog" }));
      await user.click(screen.getByRole("button", { name: "Dialog trigger" }));
      await vi.waitFor(() => expect(initialFocus).toHaveBeenCalledTimes(2));
    },
  );

  it.skipIf(isJSDOM)(
    "can focus the dialog itself, which autofocus cannot",
    async () => {
      const { user } = await render(() => (
        <Dialog
          initialFocus={() => {
            const dialog = screen.getByTestId("Dialog");
            dialog.tabIndex = -1;
            return dialog;
          }}
        >
          <button>First</button>
        </Dialog>
      ));

      await user.click(screen.getByRole("button", { name: "Dialog trigger" }));

      await vi.waitFor(() =>
        expect(document.activeElement).toBe(screen.getByTestId("Dialog")),
      );
    },
  );

  it.skipIf(isJSDOM)(
    "hands a popover's function null when the browser focused nothing inside, and moves focus in",
    async () => {
      const initialFocus = vi.fn(
        (focused: Element | null) =>
          (focused as HTMLElement | null) ??
          screen.getByRole("button", { name: "Details" }),
      );
      const { user } = await render(() => (
        <Popover initialFocus={initialFocus}>
          <button>Details</button>
        </Popover>
      ));

      await user.click(screen.getByRole("button", { name: "Popover trigger" }));
      await vi.waitFor(() => expect(initialFocus).toHaveBeenCalledWith(null));

      expect(document.activeElement).toBe(
        screen.getByRole("button", { name: "Details" }),
      );
    },
  );

  it("does nothing while closed", async () => {
    const initialFocus = vi.fn(() => undefined);
    const [open, setOpen] = createSignal(false);
    await render(() => <Dialog open={open()} initialFocus={initialFocus} />);

    setOpen(false);
    flush();
    await new Promise((resolve) => setTimeout(resolve));

    expect(initialFocus).not.toHaveBeenCalled();
  });
});
