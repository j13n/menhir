// A test dialog for createDialogClose and createOutsidePress: a trigger and
// a `<dialog>` opened with `showModal()` and closed with `close()` from an
// effect, through createControllableSignal, as Dialog (#31) will be.
import type { JSX } from "@solidjs/web";
import { createEffect, untrack } from "solid-js";

import { createControllableSignal } from "../../../src/core/createControllableSignal.ts";
import { createDialogClose } from "../../../src/floating/dismissal/dialogClose.ts";
import { createOutsidePress } from "../../../src/floating/dismissal/outsidePress.ts";
import type { OpenChangeDetails } from "../../../src/floating/dismissal/reason.ts";

export interface DialogProps {
  /** Names the trigger, "<label> trigger", and the dialog. */
  label?: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, details: OpenChangeDetails) => void;
  /** Closes on a press on the backdrop too. Read once. */
  outsidePress?: boolean;
  style?: JSX.CSSProperties;
  triggerStyle?: JSX.CSSProperties;
  children?: JSX.Element;
}

export function Dialog(props: DialogProps) {
  let dialog: HTMLDialogElement | undefined;
  const [open, setOpen] = createControllableSignal<boolean, OpenChangeDetails>({
    get value() {
      return props.open;
    },
    get defaultValue() {
      return props.defaultOpen ?? false;
    },
    onChange: (value, details) => props.onOpenChange?.(value, details),
  });
  createEffect(
    () => open(),
    (open) => {
      // jsdom has no showModal().
      if (!("showModal" in dialog!)) return;
      if (open && !dialog!.open) dialog!.showModal();
      if (!open && dialog!.open) dialog!.close();
    },
  );
  const options = {
    get dialog() {
      return dialog;
    },
    get open() {
      return open();
    },
    onDismiss: (details: OpenChangeDetails) => setOpen(false, details),
  };
  createDialogClose(options);
  if (untrack(() => props.outsidePress)) createOutsidePress(options);
  const label = () => props.label ?? "Dialog";
  return (
    <>
      <button
        type="button"
        style={props.triggerStyle}
        onClick={(event) => setOpen(true, { reason: "trigger-press", event })}
      >
        {`${label()} trigger`}
      </button>
      <dialog
        ref={(el) => (dialog = el)}
        aria-label={label()}
        data-open={open() ? "" : undefined}
        style={props.style}
      >
        <button type="button">{`Inside ${label()}`}</button>
        {props.children}
      </dialog>
    </>
  );
}
