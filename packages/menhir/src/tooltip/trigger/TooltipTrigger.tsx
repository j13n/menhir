import type { JSX } from "@solidjs/web";
import { merge, omit } from "solid-js";

import type { ButtonElementProps } from "../../core/button.ts";
import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { RenderProp } from "../../core/renderElement.tsx";
import { useTooltipRootContext } from "../root/TooltipRootContext.ts";

export interface TooltipTriggerProps extends JSX.HTMLAttributes<HTMLElement> {
  render?: RenderProp;
}

/**
 * The element the tooltip describes: a `<button type="button">` whose
 * `aria-describedby` names the Popup. Hovering it opens the tooltip after
 * the Root's `delay`, keyboard focus opens it at once, and a press closes
 * it. Place it inside `Tooltip.Root`, before `Tooltip.Popup`.
 */
export function TooltipTrigger(props: TooltipTriggerProps) {
  const root = useTooltipRootContext();
  const ownProps = merge(root.attributes, {
    type: "button",
    // Always, since the closed Popup stays in the document and still gives
    // its text (README, "Decisions"). The consumer's wins, kept out of the
    // merge, where a wrapper's `undefined` would remove it; `false` removes
    // it.
    get "aria-describedby"() {
      return props["aria-describedby"] ?? root.popupId;
    },
    // Keyboard focus only: a press that focuses the Trigger does not open
    // it (README, "Decisions").
    onFocus: (event: FocusEvent) => {
      if (root.trigger!.matches(":focus-visible"))
        root.setOpen(true, { reason: "trigger-focus", event });
    },
    // Hovered or focused keeps it open: blur does not close a tooltip whose
    // Trigger or Popup the pointer is on.
    onBlur: (event: FocusEvent) => {
      if (!root.trigger!.matches(":hover") && !root.popup?.matches(":hover"))
        root.setOpen(false, { reason: "trigger-focus", event });
    },
    // The press does what the button does, which the tooltip would cover.
    // Hover opens nothing more until the pointer comes onto it again: a
    // key's press, with the pointer elsewhere, holds nothing back.
    onClick: (event: MouseEvent) => {
      root.pressed = true;
      root.setOpen(false, { reason: "trigger-press", event });
    },
    // Added as the element is created, so it runs before hover's own
    // listener, which reads `pressed` through `disabled`.
    onPointerEnter: () => {
      root.pressed = false;
    },
    ref: (element: HTMLElement) => {
      root.trigger = element;
    },
  } satisfies ButtonElementProps);
  const elementProps = mergeElementProps(
    ownProps,
    omit(props, "render", "aria-describedby"),
  );
  return renderElement(props, elementProps, (p) => <button {...p} />);
}
