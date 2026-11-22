// A test popover for createReturnFocus: a trigger with `popovertarget` and
// a `popover="auto"` element, through createControllableSignal. The state
// follows the browser on `toggle`, as Popover (#33) will with dismissal.
import type { JSX } from "@solidjs/web";
import { createEffect, createUniqueId } from "solid-js";

import { createControllableSignal } from "../../../src/core/createControllableSignal.ts";
import { createInitialFocus } from "../../../src/floating/focus/initialFocus.ts";
import { createReturnFocus } from "../../../src/floating/focus/returnFocus.ts";
import type { FocusTarget } from "../../../src/floating/focus/target.ts";

export interface PopoverProps {
  /** Names the trigger, "<label> trigger", and the popover. */
  label?: string;
  defaultOpen?: boolean;
  initialFocus?: FocusTarget;
  returnFocus?: FocusTarget;
  children?: JSX.Element;
}

export function Popover(props: PopoverProps) {
  const id = createUniqueId();
  let popup: HTMLDivElement | undefined;
  const [open, setOpen] = createControllableSignal({
    get defaultValue() {
      return props.defaultOpen ?? false;
    },
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
  createInitialFocus({
    get popup() {
      return popup;
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
      return popup;
    },
    get open() {
      return open();
    },
    get returnFocus() {
      return props.returnFocus;
    },
  });
  const label = () => props.label ?? "Popover";
  return (
    <>
      <button type="button" popovertarget={id}>
        {`${label()} trigger`}
      </button>
      <div
        ref={(el) => (popup = el)}
        id={id}
        popover="auto"
        data-testid={label()}
        onToggle={(event) =>
          setOpen((event as ToggleEvent).newState === "open")
        }
      >
        {props.children}
      </div>
    </>
  );
}
