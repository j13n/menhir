import type { JSX } from "@solidjs/web";
import { merge, omit, onSettled } from "solid-js";

import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { RenderProp } from "../../core/renderElement.tsx";
import { useFieldRootContext } from "../root/FieldRootContext.ts";

export interface FieldDescriptionProps extends Omit<
  JSX.HTMLAttributes<HTMLElement>,
  "id"
> {
  render?: RenderProp;
}

/**
 * What the control is for, or what it takes, which describes the control
 * in `aria-describedby`: a `<p>`. Its `id` is the Root's, so the server
 * HTML links it before hydration; it takes none from the consumer. Place
 * it inside `Field.Root`.
 */
export function FieldDescription(props: FieldDescriptionProps) {
  const root = useFieldRootContext();
  // Counted once mounted, so that a Field without a Description names none
  // (README, "Decisions").
  onSettled(() => root.registerDescription());
  const ownProps = merge(root.attributes, { id: root.descriptionId });
  const elementProps = mergeElementProps(
    ownProps,
    omit(props, "render", "id" as keyof FieldDescriptionProps),
  );
  return renderElement(props, elementProps, (p) => <p {...p} />);
}
