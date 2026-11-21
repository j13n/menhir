import type { JSX } from "@solidjs/web";
import { merge, omit } from "solid-js";

import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { ElementProps, RenderProp } from "../../core/renderElement.tsx";
import { useProgressRootContext } from "../root/ProgressRootContext.ts";

export interface ProgressValueProps extends Omit<
  JSX.HTMLAttributes<HTMLElement>,
  "children"
> {
  render?: RenderProp;
}

/**
 * The value as text: a `<span>` with the Root's `aria-valuetext`, the
 * consumer's or the value in the Root's `format` and `locale`, and its
 * `data-*` attributes. Empty while indeterminate, unless the consumer gave
 * `aria-valuetext`. Place it inside `Progress.Root`.
 */
export function ProgressValue(props: ProgressValueProps) {
  const context = useProgressRootContext();
  const ownProps: ElementProps = merge(context.attributes, {
    get children() {
      return context.valueText();
    },
  });
  const elementProps = mergeElementProps(ownProps, omit(props, "render"));
  return renderElement(props, elementProps, (p) => <span {...p} />);
}
