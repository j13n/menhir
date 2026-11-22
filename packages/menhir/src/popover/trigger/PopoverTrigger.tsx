import { isDev } from "@solidjs/web";
import type { JSX } from "@solidjs/web";
import { merge, omit } from "solid-js";

import { warnUnlessButton } from "../../core/button.ts";
import type { ButtonElementProps } from "../../core/button.ts";
import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { RenderProp } from "../../core/renderElement.tsx";
import { usePopoverRootContext } from "../root/PopoverRootContext.ts";

export interface PopoverTriggerProps extends JSX.HTMLAttributes<HTMLElement> {
  render?: RenderProp;
}

/**
 * The button that opens and closes the popover: a `<button type="button"
 * aria-haspopup="dialog">` with `aria-expanded`, naming the Popup in
 * `popovertarget` and `aria-controls`. Place it inside `Popover.Root`,
 * right before `Popover.Popup`.
 */
export function PopoverTrigger(props: PopoverTriggerProps) {
  const root = usePopoverRootContext();
  const ownProps = merge(root.attributes, {
    type: "button",
    // So that the browser counts a press on the Trigger as one on the
    // popover, which light dismiss leaves open (README, "Decisions").
    popovertarget: root.popupId,
    "aria-haspopup": "dialog",
    get "aria-expanded"() {
      return root.open() ? "true" : "false";
    },
    "aria-controls": root.popupId,
    onClick: (event: MouseEvent) => {
      // The state shows and hides the popover, in the flush that places
      // it: the browser's own toggle would show it a task before.
      event.preventDefault();
      root.setOpen(!root.open(), { reason: "trigger-press", event });
    },
    ref: (element: HTMLElement) => {
      root.trigger = element;
      // Production builds drop the check with `isDev`.
      if (isDev) warnUnlessButton(element, "Popover.Trigger");
    },
  } satisfies ButtonElementProps & { popovertarget: string });
  const elementProps = mergeElementProps(ownProps, omit(props, "render"));
  return renderElement(props, elementProps, (p) => <button {...p} />);
}
