// A test tooltip for createHover: a trigger and a `popover="manual"` popup
// placed below it with a gap, opened and closed through
// createControllableSignal, as Tooltip (#34) will be.
import type { JSX } from "@solidjs/web";
import { createEffect } from "solid-js";

import { createControllableSignal } from "../../../src/core/createControllableSignal.ts";
import type { OpenChangeDetails } from "../../../src/floating/dismissal/reason.ts";
import type { HoverGroup } from "../../../src/floating/hover/group.ts";
import { createHover } from "../../../src/floating/hover/hover.ts";

export interface TooltipProps {
  /** Names the trigger, "<label> trigger", and the popup's test id. */
  label?: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, details: OpenChangeDetails) => void;
  delay?: number;
  closeDelay?: number;
  disabled?: boolean;
  group?: HoverGroup;
  /** The gap between the trigger and the popup, in pixels (default 20). */
  gap?: number;
  children?: JSX.Element;
}

export function Tooltip(props: TooltipProps) {
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
      // jsdom has no popover, and no layout to place it in.
      if (!("showPopover" in popup!)) return;
      const showing = popup!.matches(":popover-open");
      if (open && !showing) {
        popup!.showPopover();
        const { left, bottom } = trigger!.getBoundingClientRect();
        popup!.style.inset = `${bottom + (props.gap ?? 20)}px auto auto ${left}px`;
      }
      if (!open && showing) popup!.hidePopover();
    },
  );
  createHover({
    get trigger() {
      return trigger;
    },
    get popup() {
      return popup;
    },
    get open() {
      return open();
    },
    get delay() {
      return props.delay;
    },
    get closeDelay() {
      return props.closeDelay;
    },
    get disabled() {
      return props.disabled;
    },
    get group() {
      return props.group;
    },
    onOpenChange: (value, details) => setOpen(value, details),
  });
  const label = () => props.label ?? "Tooltip";
  return (
    <>
      <button
        ref={(el) => (trigger = el)}
        type="button"
        style={{ width: "80px", height: "30px", margin: "0" }}
      >
        {`${label()} trigger`}
      </button>
      <div
        ref={(el) => (popup = el)}
        popover="manual"
        role="tooltip"
        data-testid={label()}
        data-open={open() ? "" : undefined}
        style={{ margin: "0", width: "120px", height: "40px", padding: "0" }}
      >
        {label()}
        {props.children}
      </div>
    </>
  );
}
