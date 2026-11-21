import type { JSX } from "@solidjs/web";
import { merge, omit } from "solid-js";

import { twoStateButtonProps } from "../../core/button.ts";
import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { RenderProp } from "../../core/renderElement.tsx";
import { useAccordionItemContext } from "../item/AccordionItemContext.ts";

export interface AccordionTriggerProps extends JSX.HTMLAttributes<HTMLElement> {
  render?: RenderProp;
}

/**
 * The button that shows and hides its section's Panel: a
 * `<button aria-expanded>`. Place it inside `Accordion.Header`.
 */
export function AccordionTrigger(props: AccordionTriggerProps) {
  const item = useAccordionItemContext();
  // The consumer's `id`, else the generated one, which the Panel, created
  // after the Trigger, names. Kept out of the merge, where a wrapper's
  // `id={undefined}` would remove it ("`undefined` is a value", PLAN.md
  // section 8).
  const generatedId = item.triggerId;
  const id = () => props.id ?? generatedId();
  item.triggerId = id;

  const ownProps = merge(
    item.attributes,
    twoStateButtonProps(
      {
        get value() {
          return item.open();
        },
        get disabled() {
          return item.disabled();
        },
        setValue: item.setOpen,
      },
      "aria-expanded",
      "Accordion.Trigger",
    ),
    {
      get id() {
        return id();
      },
      "aria-controls": item.panelId,
    },
  );
  const elementProps = mergeElementProps(ownProps, omit(props, "render", "id"));
  return renderElement(props, elementProps, (p) => <button {...p} />);
}
