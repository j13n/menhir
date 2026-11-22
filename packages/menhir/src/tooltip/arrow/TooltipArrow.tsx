import type { JSX } from "@solidjs/web";
import { merge, omit, onSettled } from "solid-js";

import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { ElementProps, RenderProp } from "../../core/renderElement.tsx";
import { arrow } from "../../floating/positioning/arrow.ts";
import { useTooltipPopupContext } from "../popup/TooltipPopupContext.ts";
import { useTooltipRootContext } from "../root/TooltipRootContext.ts";

export interface TooltipArrowProps extends JSX.HTMLAttributes<HTMLElement> {
  render?: RenderProp;
}

/**
 * An arrow that points at the anchor's center: an `aria-hidden` `<div>`
 * whose `left` or `top` the Popup writes. Position it absolutely on the
 * Popup's edge by its `data-side`. Place it inside `Tooltip.Popup`.
 */
export function TooltipArrow(props: TooltipArrowProps) {
  const root = useTooltipRootContext();
  const popup = useTooltipPopupContext();
  let element: HTMLElement | undefined;
  // Handed over once mounted, when the element is there to measure.
  onSettled(() => popup.registerArrow(() => arrow({ element: element! })));
  const ownProps = merge(root.attributes, {
    "aria-hidden": "true",
    get "data-side"() {
      return popup.position()?.side;
    },
    get "data-align"() {
      return popup.position()?.align;
    },
    ref: (el: HTMLElement) => {
      element = el;
    },
  } satisfies ElementProps);
  const elementProps = mergeElementProps(ownProps, omit(props, "render"));
  return renderElement(props, elementProps, (p) => <div {...p} />);
}
