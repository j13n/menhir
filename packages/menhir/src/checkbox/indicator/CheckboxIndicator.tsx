import type { JSX } from "@solidjs/web";
import { omit } from "solid-js";

import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { RenderProp } from "../../core/renderElement.tsx";
import { useCheckboxRootContext } from "../root/CheckboxRootContext.ts";

export interface CheckboxIndicatorProps extends JSX.HTMLAttributes<HTMLElement> {
  render?: RenderProp;
}

/**
 * The check mark: a `<span>` with the Root's `data-*` attributes, always
 * rendered, so that CSS shows it by state. Place it inside `Checkbox.Root`.
 */
export function CheckboxIndicator(props: CheckboxIndicatorProps) {
  const elementProps = mergeElementProps(
    useCheckboxRootContext(),
    omit(props, "render"),
  );
  return renderElement(props, elementProps, (p) => <span {...p} />);
}
