import type { JSX } from "@solidjs/web";
import { omit } from "solid-js";

import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { RenderProp } from "../../core/renderElement.tsx";
import { useRadioItemContext } from "../item/RadioItemContext.ts";

export interface RadioIndicatorProps extends JSX.HTMLAttributes<HTMLElement> {
  render?: RenderProp;
}

/**
 * The dot: a `<span>` with its Item's `data-*` attributes, always rendered,
 * so that CSS shows it by state. Place it inside `Radio.Item`.
 */
export function RadioIndicator(props: RadioIndicatorProps) {
  const elementProps = mergeElementProps(
    useRadioItemContext(),
    omit(props, "render"),
  );
  return renderElement(props, elementProps, (p) => <span {...p} />);
}
