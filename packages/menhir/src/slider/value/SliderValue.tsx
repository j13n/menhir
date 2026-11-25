import type { JSX } from "@solidjs/web";
import { merge, omit } from "solid-js";

import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { ElementProps, RenderProp } from "../../core/renderElement.tsx";
import { useSliderRootContext } from "../root/SliderRootContext.ts";

export interface SliderValueProps extends Omit<
  JSX.HTMLAttributes<HTMLElement>,
  "children"
> {
  /** Renders the value as another element or component. Read once. */
  render?: RenderProp;
}

/**
 * The value as text: a `<span>` with the Root's `aria-valuetext`, the value
 * in its `format` and `locale`. Place it inside `Slider.Root`.
 */
export function SliderValue(props: SliderValueProps) {
  const root = useSliderRootContext();
  const ownProps = merge(root.attributes, {
    get children() {
      return root.text();
    },
  }) as ElementProps;
  const elementProps = mergeElementProps(ownProps, omit(props, "render"));
  return renderElement(props, elementProps, (p) => <span {...p} />);
}
