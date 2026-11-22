// A test tooltip for createEscape: a trigger and a `popover="manual"`
// element, opened and closed through createControllableSignal, as Tooltip
// (#34) will be.
import type { JSX } from "@solidjs/web";
import { createEffect } from "solid-js";

import { createControllableSignal } from "../../../src/core/createControllableSignal.ts";
import { createEscape } from "../../../src/floating/dismissal/escape.ts";
import type { OpenChangeDetails } from "../../../src/floating/dismissal/reason.ts";

export interface TooltipProps {
  /** Names the trigger, "<label> trigger", and the tooltip. */
  label?: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, details: OpenChangeDetails) => void;
  children?: JSX.Element;
}

export function Tooltip(props: TooltipProps) {
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
  createEscape({
    get open() {
      return open();
    },
    onDismiss: (details) => setOpen(false, details),
  });
  const label = () => props.label ?? "Tooltip";
  return (
    <>
      <button
        type="button"
        onClick={(event) => setOpen(true, { reason: "trigger-press", event })}
      >
        {`${label()} trigger`}
      </button>
      <div
        ref={(el) => (popup = el)}
        popover="manual"
        role="tooltip"
        data-testid={label()}
        data-open={open() ? "" : undefined}
      >
        {label()}
        {props.children}
      </div>
    </>
  );
}
