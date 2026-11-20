import type { JSX } from "@solidjs/web";
import { omit } from "solid-js";

import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { RenderProp } from "../../core/renderElement.tsx";
import { useSwitchRootContext } from "../root/SwitchRootContext.ts";

export interface SwitchThumbProps extends JSX.HTMLAttributes<HTMLElement> {
  render?: RenderProp;
}

/**
 * The part of the switch that slides between off and on: a `<span>` with
 * the Root's `data-*` attributes. Place it inside `Switch.Root`.
 */
export function SwitchThumb(props: SwitchThumbProps) {
  const elementProps = mergeElementProps(
    useSwitchRootContext(),
    omit(props, "render"),
  );
  return renderElement(props, elementProps, (p) => <span {...p} />);
}
