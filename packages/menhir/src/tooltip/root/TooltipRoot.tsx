import type { JSX } from "@solidjs/web";
import { createUniqueId, useContext } from "solid-js";

import { createControllableSignal } from "../../core/createControllableSignal.ts";
import { createEscape } from "../../floating/dismissal/escape.ts";
import type { OpenChangeDetails } from "../../floating/dismissal/reason.ts";
import { createHover } from "../../floating/hover/hover.ts";
import { TooltipGroupContext } from "../group/TooltipGroupContext.ts";
import { TooltipRootContext } from "./TooltipRootContext.ts";
import type {
  TooltipRootContextValue,
  TooltipStateAttributes,
} from "./TooltipRootContext.ts";

export interface TooltipRootProps {
  /** Whether the tooltip is open, when controlled. */
  open?: boolean;
  /** Whether the tooltip is open at first, when uncontrolled. */
  defaultOpen?: boolean;
  /**
   * Called with the new value, and why, when the user opens or closes the
   * tooltip. When controlled, the tooltip changes only if `open` does.
   */
  onOpenChange?: (open: boolean, details: OpenChangeDetails) => void;
  /**
   * How long the pointer rests on the Trigger before the tooltip opens, in
   * milliseconds. Default 600, or the Group's.
   */
  delay?: number;
  /**
   * How long after the pointer has left the Trigger and the Popup the
   * tooltip closes, in milliseconds. Default 0.
   */
  closeDelay?: number;
  children?: JSX.Element;
}

/**
 * A short description of its Trigger, shown on hover and on keyboard
 * focus: holds whether it is open and shares it with `Tooltip.Trigger` and
 * `Tooltip.Popup`. Renders no element of its own. Inside a `Tooltip.Group`,
 * it joins the group's delays.
 */
export function TooltipRoot(props: TooltipRootProps) {
  const [open, setOpen] = createControllableSignal<boolean, OpenChangeDetails>({
    get value() {
      return props.open;
    },
    get defaultValue() {
      return props.defaultOpen ?? false;
    },
    onChange: (value, details) => props.onOpenChange?.(value, details),
  });
  const attributes: TooltipStateAttributes = {
    get "data-open"() {
      return open() ? "" : undefined;
    },
    get "data-closed"() {
      return open() ? undefined : "";
    },
  };
  const context: TooltipRootContextValue = {
    open,
    setOpen,
    popupId: createUniqueId(),
    trigger: undefined,
    popup: undefined,
    pressed: false,
    attributes,
  };
  const group = useContext(TooltipGroupContext) ?? undefined;
  createHover({
    get trigger() {
      return context.trigger;
    },
    get popup() {
      return context.popup;
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
    // Read when the pointer enters and when the delay ends. A disabled
    // button cannot take focus, so its tooltip would be the pointer's
    // alone; a press before the delay ended cancels the opening (README,
    // "Decisions").
    get disabled() {
      return (
        context.pressed ||
        (context.trigger as HTMLButtonElement | undefined)?.disabled
      );
    },
    group,
    // Hovered or focused keeps it open: the pointer leaving does not close
    // a tooltip whose Trigger has keyboard focus (README, "Decisions").
    onOpenChange: (value, details) => {
      if (value || !context.trigger?.matches(":focus-visible"))
        setOpen(value, details);
    },
  });
  createEscape({
    get open() {
      return open();
    },
    onDismiss: (details) => setOpen(false, details),
  });
  return (
    <TooltipRootContext value={context}>{props.children}</TooltipRootContext>
  );
}
