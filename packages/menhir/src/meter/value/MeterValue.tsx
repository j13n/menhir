import type { JSX } from "@solidjs/web";
import { omit } from "solid-js";

import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { ElementProps, RenderProp } from "../../core/renderElement.tsx";
import { useMeterRootContext } from "../root/MeterRootContext.ts";

export interface MeterValueProps extends Omit<
  JSX.HTMLAttributes<HTMLElement>,
  "children"
> {
  render?: RenderProp;
}

/**
 * The value as text: a `<span>` with the Root's `aria-valuetext`, the
 * consumer's or the value in the Root's `format` and `locale`. Place it
 * inside `Meter.Root`.
 */
export function MeterValue(props: MeterValueProps) {
  const context = useMeterRootContext();
  const ownProps: ElementProps = {
    get children() {
      return context.valueText();
    },
  };
  const elementProps = mergeElementProps(ownProps, omit(props, "render"));
  return renderElement(props, elementProps, (p) => <span {...p} />);
}
