import type { JSX } from "@solidjs/web";
import { omit } from "solid-js";

import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { RenderProp } from "../../core/renderElement.tsx";
import { useAccordionItemContext } from "../item/AccordionItemContext.ts";

export interface AccordionHeaderProps extends JSX.HTMLAttributes<HTMLElement> {
  render?: RenderProp;
}

/**
 * The heading of a section, which holds only its `Accordion.Trigger`: an
 * `<h3>`. Render another level with `render={(props) => <h2 {...props} />}`.
 * Place it inside `Accordion.Item`.
 */
export function AccordionHeader(props: AccordionHeaderProps) {
  const item = useAccordionItemContext();
  const elementProps = mergeElementProps(
    item.attributes,
    omit(props, "render"),
  );
  return renderElement(props, elementProps, (p) => <h3 {...p} />);
}
