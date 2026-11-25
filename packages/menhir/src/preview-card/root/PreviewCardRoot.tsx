import type { JSX } from "@solidjs/web";
import { createEffect, onCleanup } from "solid-js";

import { createControllableSignal } from "../../core/createControllableSignal.ts";
import { createEscape } from "../../floating/dismissal/escape.ts";
import type { OpenChangeDetails } from "../../floating/dismissal/reason.ts";
import { createHover } from "../../floating/hover/hover.ts";
import { PreviewCardRootContext } from "./PreviewCardRootContext.ts";
import type {
  PreviewCardRootContextValue,
  PreviewCardStateAttributes,
} from "./PreviewCardRootContext.ts";

export interface PreviewCardRootProps {
  /** Whether the card is open, when controlled. */
  open?: boolean;
  /** Whether the card is open at first, when uncontrolled. */
  defaultOpen?: boolean;
  /**
   * Called with the new value, and why, when the user opens or closes the
   * card. When controlled, the card changes only if `open` does.
   */
  onOpenChange?: (open: boolean, details: OpenChangeDetails) => void;
  /**
   * How long the pointer rests on the Trigger, or keyboard focus stays on
   * it, before the card opens, in milliseconds. Default 700.
   */
  delay?: number;
  /**
   * How long after the pointer has left the Trigger and the Popup the card
   * closes, in milliseconds. Default 300.
   */
  closeDelay?: number;
  children?: JSX.Element;
}

/** Whether keyboard focus is on `element` or inside it. */
const hasKeyboardFocus = (element: HTMLElement | undefined) =>
  !!element &&
  (element.matches(":focus-visible") ||
    !!element.querySelector(":focus-visible"));

/** Whether the pointer is on `element`. */
const isHovered = (element: HTMLElement | undefined) =>
  !!element?.matches(":hover");

/**
 * A card that previews where a link leads, shown on hover and on keyboard
 * focus: holds whether it is open and shares it with `PreviewCard.Trigger`
 * and `PreviewCard.Popup`. Renders no element of its own.
 */
export function PreviewCardRoot(props: PreviewCardRootProps) {
  const [open, setOpen] = createControllableSignal<boolean, OpenChangeDetails>({
    get value() {
      return props.open;
    },
    get defaultValue() {
      return props.defaultOpen ?? false;
    },
    onChange: (value, details) => props.onOpenChange?.(value, details),
  });
  const attributes: PreviewCardStateAttributes = {
    get "data-open"() {
      return open() ? "" : undefined;
    },
    get "data-closed"() {
      return open() ? undefined : "";
    },
  };
  const delay = () => props.delay ?? 700;
  let focusTimer: ReturnType<typeof setTimeout> | undefined;
  const cancelFocus = () => clearTimeout(focusTimer);
  onCleanup(cancelFocus);
  // While focus is moved back to the Trigger, which opens nothing.
  let returning = false;
  const context: PreviewCardRootContextValue = {
    open,
    setOpen,
    // After the delay, as hover opens it: opened at once, Tab through a
    // paragraph of links would open a card at each (README, "Decisions").
    // A delay of 0 opens in the same event, as hover's does.
    openOnFocus: (event) => {
      cancelFocus();
      if (returning) return;
      const set = () => {
        if (!open()) setOpen(true, { reason: "trigger-focus", event });
      };
      if (delay() > 0) focusTimer = setTimeout(set, delay());
      else set();
    },
    cancelFocus,
    // Focus may move between the Trigger and the Popup, and hovered keeps
    // it open (README, "Decisions").
    closeOnFocusLeaving: (to, details) => {
      cancelFocus();
      const { trigger, popup } = context;
      if (
        !(
          to instanceof Node &&
          (trigger?.contains(to) || popup?.contains(to))
        ) &&
        !isHovered(trigger) &&
        !isHovered(popup)
      )
        setOpen(false, details);
    },
    trigger: undefined,
    popup: undefined,
    pressed: false,
    attributes,
  };
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
      return delay();
    },
    get closeDelay() {
      return props.closeDelay ?? 300;
    },
    // Read when the pointer enters and when the delay ends: a press before
    // the delay ended cancels the opening (README, "Decisions").
    get disabled() {
      return context.pressed;
    },
    // Hovered or focused keeps it open: the pointer leaving does not close
    // a card whose Trigger or Popup has keyboard focus.
    onOpenChange: (value, details) => {
      if (
        value ||
        !(hasKeyboardFocus(context.trigger) || hasKeyboardFocus(context.popup))
      )
        setOpen(value, details);
    },
  });
  // Hiding a `manual` popover that holds focus leaves it on the `<body>`,
  // so focus inside a card that closes goes back to its Trigger, without
  // opening it again (README, "Decisions"). Before the Popup's presence
  // runs, which leaves a popup that holds no focus `inert` as it leaves.
  createEffect(
    () => open(),
    (value) => {
      if (value || !context.popup?.contains(document.activeElement)) return;
      returning = true;
      context.trigger?.focus();
      returning = false;
    },
  );
  createEscape({
    get open() {
      return open();
    },
    onDismiss: (details) => setOpen(false, details),
  });
  return (
    <PreviewCardRootContext value={context}>
      {props.children}
    </PreviewCardRootContext>
  );
}
