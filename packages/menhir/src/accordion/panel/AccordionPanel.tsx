import type { JSX } from "@solidjs/web";
import { merge, omit } from "solid-js";

import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { RenderProp } from "../../core/renderElement.tsx";
import { useAccordionItemContext } from "../item/AccordionItemContext.ts";

// No `id`: the Item generates the Panel's, which the Trigger names in
// `aria-controls` (README, "Shape").
export interface AccordionPanelProps extends Omit<
  JSX.HTMLAttributes<HTMLElement>,
  "id"
> {
  render?: RenderProp;
}

/**
 * The content its section's Trigger shows and hides: a
 * `<div role="region">` named by the Trigger, `hidden` while closed. Place
 * it inside `Accordion.Item`, after `Accordion.Header`.
 */
export function AccordionPanel(props: AccordionPanelProps) {
  const item = useAccordionItemContext();
  const ownProps = merge(item.attributes, {
    id: item.panelId,
    role: "region" as const,
    get "aria-labelledby"() {
      return item.triggerId();
    },
    get hidden() {
      return !item.open();
    },
  });
  const elementProps = mergeElementProps(
    ownProps,
    // An `id` from untyped code would break the Trigger's `aria-controls`,
    // so it is dropped too.
    omit(props as AccordionPanelProps & { id?: string }, "render", "id"),
  );
  return renderElement(props, elementProps, (p) => <div {...p} />);
}
