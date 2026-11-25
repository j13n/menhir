import type { JSX } from "@solidjs/web";
import { merge, omit, onSettled } from "solid-js";

import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { ElementProps, RenderProp } from "../../core/renderElement.tsx";
import { useScrollAreaRootContext } from "../root/ScrollAreaRootContext.ts";

export interface ScrollAreaContentProps extends JSX.HTMLAttributes<HTMLElement> {
  /** Renders the content with your own component. Read once. */
  render?: RenderProp;
}

/**
 * What scrolls: a `<div>` inside the Viewport, whose changes of size the
 * area follows. At least as wide as what it holds, so that content wider
 * than the viewport widens it too. Place it inside `ScrollArea.Viewport`.
 */
export function ScrollAreaContent(props: ScrollAreaContentProps) {
  const root = useScrollAreaRootContext();
  let element: HTMLElement | undefined;
  onSettled(() => root.observe(element!));
  const ownProps = merge(root.attributes, {
    style: { "min-width": "fit-content" },
    ref: (el: HTMLElement) => {
      element = el;
    },
  }) as ElementProps;
  const elementProps = mergeElementProps(ownProps, omit(props, "render"));
  return renderElement(props, elementProps, (p) => <div {...p} />);
}
