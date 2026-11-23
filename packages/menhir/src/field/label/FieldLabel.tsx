import type { JSX } from "@solidjs/web";
import { merge, omit } from "solid-js";

import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { ElementProps, RenderProp } from "../../core/renderElement.tsx";
import { useFieldRootContext } from "../root/FieldRootContext.ts";

export interface FieldLabelProps extends JSX.HTMLAttributes<HTMLElement> {
  render?: RenderProp;
}

/**
 * The control's label: a `<label>` whose `for` is the control's `id`, which
 * the Root generates, so the server HTML is labelled before hydration.
 * Place it inside `Field.Root`.
 */
export function FieldLabel(props: FieldLabelProps) {
  const root = useFieldRootContext();
  // `for` is a label's attribute, which `ElementProps`, typed for any
  // element, does not list.
  const ownProps = merge(root.attributes, {
    for: root.controlId,
  }) as ElementProps;
  const elementProps = mergeElementProps(ownProps, omit(props, "render"));
  return renderElement(props, elementProps, (p) => <label {...p} />);
}
