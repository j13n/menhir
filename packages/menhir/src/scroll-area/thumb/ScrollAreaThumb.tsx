import type { JSX } from "@solidjs/web";
import { merge, omit } from "solid-js";

import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { ElementProps, RenderProp } from "../../core/renderElement.tsx";
import { useScrollAreaRootContext } from "../root/ScrollAreaRootContext.ts";
import { useScrollAreaScrollbarContext } from "../scrollbar/ScrollAreaScrollbarContext.ts";

export interface ScrollAreaThumbProps extends JSX.HTMLAttributes<HTMLElement> {
  /** Renders the thumb with your own component. Read once. */
  render?: RenderProp;
}

/**
 * The thumb: a `<div>` that the consumer sizes and places with its
 * Scrollbar's `--thumb-size` and `--thumb-position`, and that a drag moves.
 * Place it inside `ScrollArea.Scrollbar`.
 */
export function ScrollAreaThumb(props: ScrollAreaThumbProps) {
  const root = useScrollAreaRootContext();
  const scrollbar = useScrollAreaScrollbarContext();
  const ownProps = merge(root.attributes, scrollbar.attributes, {
    ref: (element: HTMLElement) => {
      scrollbar.thumb = element;
    },
  }) as ElementProps;
  const elementProps = mergeElementProps(ownProps, omit(props, "render"));
  return renderElement(props, elementProps, (p) => <div {...p} />);
}
