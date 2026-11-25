import type { JSX } from "@solidjs/web";
import { merge, omit, onSettled } from "solid-js";

import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { ElementProps, RenderProp } from "../../core/renderElement.tsx";
import { useScrollAreaRootContext } from "../root/ScrollAreaRootContext.ts";

export interface ScrollAreaViewportProps extends JSX.HTMLAttributes<HTMLElement> {
  /** Renders the scroller with your own component. Read once. */
  render?: RenderProp;
}

/**
 * The scroller: a `<div>` with `role="region"`. Give it `overflow: auto`,
 * a size, and a name with `aria-label` or `aria-labelledby`. Place it
 * inside `ScrollArea.Root`.
 */
export function ScrollAreaViewport(props: ScrollAreaViewportProps) {
  const root = useScrollAreaRootContext();
  let element: HTMLElement | undefined;
  onSettled(() => root.observe(element!));
  const ownProps = merge(root.attributes, {
    role: "region",
    // A tab stop while there is something to scroll, so that the keys
    // scroll it in every browser: WebKit does not focus a scroller itself.
    get tabindex() {
      return root.overflows("x") || root.overflows("y") ? 0 : undefined;
    },
    get style() {
      return root.hidesSystem() ? { "scrollbar-width": "none" } : undefined;
    },
    onScroll: root.scrolled,
    ref: (el: HTMLElement) => {
      element = root.viewport = el;
    },
  }) as ElementProps;
  const elementProps = mergeElementProps(ownProps, omit(props, "render"));
  return renderElement(props, elementProps, (p) => <div {...p} />);
}
