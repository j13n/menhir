import type { JSX } from "@solidjs/web";
import { omit } from "solid-js";

import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { RenderProp } from "../../core/renderElement.tsx";
import { useProgressRootContext } from "../root/ProgressRootContext.ts";

export interface ProgressIndicatorProps extends JSX.HTMLAttributes<HTMLElement> {
  render?: RenderProp;
}

/**
 * The filled part of the bar: a `<div>` with the Root's `data-*` attributes.
 * It draws nothing; size it with `--progress`, which it inherits from the
 * Root. Place it inside `Progress.Root`.
 */
export function ProgressIndicator(props: ProgressIndicatorProps) {
  const elementProps = mergeElementProps(
    useProgressRootContext().attributes,
    omit(props, "render"),
  );
  return renderElement(props, elementProps, (p) => <div {...p} />);
}
