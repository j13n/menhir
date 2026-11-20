import type { JSX } from "@solidjs/web";
import { untrack } from "solid-js";

/**
 * The props a part hands to its element, or to the consumer's `render`
 * function. Typed for `HTMLElement` so that they spread onto any tag. `ref`
 * is narrowed to a callback: `JSX.Ref<HTMLElement>` also allows an element
 * and an array, which are not assignable to the ref of a specific element.
 */
export type ElementProps = Omit<JSX.HTMLAttributes<HTMLElement>, "ref"> & {
  ref?: (element: HTMLElement) => void;
};

/**
 * A part's `render` prop: the component to render the part with. It
 * receives the element's props, spreads them and adds only what the part
 * cannot know, such as `href`.
 */
export type RenderProp = (props: ElementProps) => JSX.Element;

/**
 * Renders a part's element: the consumer's `render` if there is one, else
 * the part's `fallback`. `render` is read once, untracked, when the part is
 * created, as an event handler is. Call it in the part's body, with
 * `elementProps` already merged (`mergeElementProps`).
 */
export function renderElement(
  props: { render?: RenderProp },
  elementProps: ElementProps,
  fallback: RenderProp,
): JSX.Element {
  const Render = untrack(() => props.render) ?? fallback;
  return <Render {...elementProps} />;
}
