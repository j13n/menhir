// A test popover for createPopoverClose: a trigger with `popovertarget` and
// a `popover="auto"` element, through createControllableSignal, as Popover
// (#33) will be. The browser opens it from the trigger; the state follows
// on `toggle`.
import type { JSX } from "@solidjs/web";
import { createEffect, createUniqueId } from "solid-js";

import { createControllableSignal } from "../../../src/core/createControllableSignal.ts";
import { createPopoverClose } from "../../../src/floating/dismissal/popoverClose.ts";
import type { OpenChangeDetails } from "../../../src/floating/dismissal/reason.ts";

export interface PopoverProps {
  /** Names the trigger, "<label> trigger", and the popover. */
  label?: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, details: OpenChangeDetails) => void;
  children?: JSX.Element;
}

export function Popover(props: PopoverProps) {
  const id = createUniqueId();
  let trigger: HTMLButtonElement | undefined;
  let popup: HTMLDivElement | undefined;
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
      // jsdom has no popover.
      if (!("showPopover" in popup!)) return;
      const showing = popup!.matches(":popover-open");
      if (open && !showing) popup!.showPopover();
      if (!open && showing) popup!.hidePopover();
    },
  );
  createPopoverClose({
    get popup() {
      return popup;
    },
    get trigger() {
      return trigger;
    },
    get open() {
      return open();
    },
    onDismiss: (details) => setOpen(false, details),
  });
  const label = () => props.label ?? "Popover";
  return (
    <>
      <button ref={(el) => (trigger = el)} type="button" popovertarget={id}>
        {`${label()} trigger`}
      </button>
      <div
        ref={(el) => (popup = el)}
        id={id}
        popover="auto"
        data-testid={label()}
        data-open={open() ? "" : undefined}
        // On `toggle`, once the browser has shown it: written on
        // `beforetoggle`, the state's flush would run inside the browser's
        // show with a real press, and the effect's showPopover() would throw.
        onToggle={(event) => {
          if ((event as ToggleEvent).newState === "open" && !open())
            setOpen(true, { reason: "trigger-press", event });
        }}
      >
        <button type="button">{`Inside ${label()}`}</button>
        {props.children}
      </div>
    </>
  );
}
