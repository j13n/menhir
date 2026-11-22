// A test dialog for createPresence: a trigger and a `<dialog>` with
// `data-open` and `data-closed`, through createControllableSignal, which
// createPresence shows and hides, with createDialogClose for Escape, as
// Dialog (#31) is.
import type { JSX } from "@solidjs/web";
import { untrack } from "solid-js";

import { createControllableSignal } from "../../../src/core/createControllableSignal.ts";
import { createDialogClose } from "../../../src/floating/dismissal/dialogClose.ts";
import type { OpenChangeDetails } from "../../../src/floating/dismissal/reason.ts";
import { createPresence } from "../../../src/floating/presence/presence.ts";
import { createScrollLock } from "../../../src/floating/scroll-lock/scrollLock.ts";

export interface DialogProps {
  open?: boolean;
  defaultOpen?: boolean;
  /** Gets no details from the close button, whose reason is Dialog's (#31). */
  onOpenChange?: (open: boolean, details?: OpenChangeDetails) => void;
  /** Locks the page's scroll while open. Read once. */
  lock?: boolean;
  class?: string;
  inert?: boolean;
  children?: JSX.Element;
}

export function Dialog(props: DialogProps) {
  let dialog: HTMLDialogElement | undefined;
  const [open, setOpen] = createControllableSignal<
    boolean,
    OpenChangeDetails | undefined
  >({
    get value() {
      return props.open;
    },
    get defaultValue() {
      return props.defaultOpen ?? false;
    },
    onChange: (value, details) => props.onOpenChange?.(value, details),
  });
  createPresence({
    get popup() {
      return dialog;
    },
    get open() {
      return open();
    },
  });
  createDialogClose({
    get dialog() {
      return dialog;
    },
    get open() {
      return open();
    },
    onDismiss: (details) => setOpen(false, details),
  });
  if (untrack(() => props.lock)) {
    createScrollLock({
      get popup() {
        return dialog;
      },
      get open() {
        return open();
      },
    });
  }
  return (
    <>
      <button
        type="button"
        onClick={(event) => setOpen(true, { reason: "trigger-press", event })}
      >
        Dialog trigger
      </button>
      <dialog
        ref={(el) => (dialog = el)}
        aria-label="Dialog"
        data-testid="Dialog"
        class={props.class}
        inert={props.inert}
        data-open={open() ? "" : undefined}
        data-closed={open() ? undefined : ""}
      >
        {props.children}
        <button type="button" onClick={() => setOpen(false, undefined)}>
          Close Dialog
        </button>
      </dialog>
    </>
  );
}
