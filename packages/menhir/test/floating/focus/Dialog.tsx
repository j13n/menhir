// A test dialog for createTabWrap and createReturnFocus: a trigger and a
// `<dialog>` opened with `showModal()` and closed with `close()` from an
// effect, through createControllableSignal, as Dialog (#31) will be.
import type { JSX } from "@solidjs/web";
import { createEffect, untrack } from "solid-js";

import { createControllableSignal } from "../../../src/core/createControllableSignal.ts";
import { createInitialFocus } from "../../../src/floating/focus/initialFocus.ts";
import { createReturnFocus } from "../../../src/floating/focus/returnFocus.ts";
import type { FocusTarget } from "../../../src/floating/focus/target.ts";
import { createTabWrap } from "../../../src/floating/focus/tabWrap.ts";

export interface DialogProps {
  /** Names the trigger, "<label> trigger", the dialog and its close button. */
  label?: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Wraps Tab inside the dialog (default true). Read once. */
  wrap?: boolean;
  initialFocus?: FocusTarget;
  returnFocus?: FocusTarget;
  /**
   * Receives what closes the dialog instead of calling it, so the test
   * closes it later, as presence (#96) will after an exit animation.
   */
  deferClose?: (close: () => void) => void;
  children?: JSX.Element;
}

export function Dialog(props: DialogProps) {
  let dialog: HTMLDialogElement | undefined;
  const [open, setOpen] = createControllableSignal({
    get value() {
      return props.open;
    },
    get defaultValue() {
      return props.defaultOpen ?? false;
    },
    onChange: (value) => props.onOpenChange?.(value),
  });
  createEffect(
    () => open(),
    (open) => {
      // jsdom has no showModal().
      if (!("showModal" in dialog!)) return;
      if (open && !dialog!.open) dialog!.showModal();
      if (!open && dialog!.open) {
        const close = () => dialog!.close();
        const defer = untrack(() => props.deferClose);
        if (defer) defer(close);
        else close();
      }
    },
  );
  if (untrack(() => props.wrap) !== false) {
    createTabWrap({
      get dialog() {
        return dialog;
      },
      get open() {
        return open();
      },
    });
  }
  createInitialFocus({
    get popup() {
      return dialog;
    },
    get open() {
      return open();
    },
    get initialFocus() {
      return props.initialFocus;
    },
  });
  createReturnFocus({
    get popup() {
      return dialog;
    },
    get open() {
      return open();
    },
    get returnFocus() {
      return props.returnFocus;
    },
  });
  const label = () => props.label ?? "Dialog";
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        {`${label()} trigger`}
      </button>
      <dialog
        ref={(el) => (dialog = el)}
        aria-label={label()}
        data-testid={label()}
      >
        {props.children}
        <button type="button" onClick={() => setOpen(false)}>
          {`Close ${label()}`}
        </button>
      </dialog>
    </>
  );
}
