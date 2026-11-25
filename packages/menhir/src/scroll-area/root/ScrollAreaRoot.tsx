import type { JSX } from "@solidjs/web";
import { createSignal, omit, onSettled } from "solid-js";

import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { RenderProp } from "../../core/renderElement.tsx";
import { ScrollAreaRootContext } from "./ScrollAreaRootContext.ts";
import type {
  ScrollAreaAxis,
  ScrollAreaRootContextValue,
} from "./ScrollAreaRootContext.ts";

export interface ScrollAreaRootProps extends JSX.HTMLAttributes<HTMLElement> {
  /** Renders the area with your own component. Read once. */
  render?: RenderProp;
}

// How long after the last `scroll` event the area stops being
// `data-scrolling`. Consumers who want a scrollbar to linger add a
// `transition-delay`.
const scrollingFor = 150;

const flag = (on: boolean) => (on ? ("" as const) : undefined);

/**
 * The scroll area: a `<div>` around its Viewport and Scrollbars, which the
 * consumer positions the Scrollbars in. It measures the Viewport and the
 * Content when either changes size, and reads the scroll position on each
 * `scroll` event, never layout on each frame.
 */
export function ScrollAreaRoot(props: ScrollAreaRootProps) {
  // Each axis's viewport length and content length, and the distance
  // scrolled from its start: `|scrollLeft|`, which runs negative right to
  // left.
  const [size, setSize] = createSignal<
    Record<ScrollAreaAxis, { viewport: number; content: number }>
  >({ x: { viewport: 0, content: 0 }, y: { viewport: 0, content: 0 } });
  const [position, setPosition] = createSignal({ x: 0, y: 0 });
  const [scrolling, setScrolling] = createSignal(false);
  // Whether this browser can hide the system's scrollbars, known once
  // mounted, and how many Scrollbars would replace them.
  const [canHide, setCanHide] = createSignal(false);
  const [scrollbars, setScrollbars] = createSignal(0);
  let observer: ResizeObserver | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const readPosition = () => {
    const viewport = context.viewport!;
    setPosition({ x: Math.abs(viewport.scrollLeft), y: viewport.scrollTop });
  };
  const measure = () => {
    const viewport = context.viewport;
    if (!viewport) return;
    setSize({
      x: { viewport: viewport.clientWidth, content: viewport.scrollWidth },
      y: { viewport: viewport.clientHeight, content: viewport.scrollHeight },
    });
    // A change of size may have moved the scroll position.
    readPosition();
  };
  // How far the axis scrolls. Overflow of 1 px or less does not count, so
  // a fractional size or a zoom level that rounds the content one pixel
  // past the viewport makes no scrollbar.
  const range = (axis: ScrollAreaAxis) =>
    size()[axis].content - size()[axis].viewport;
  const overflows = (axis: ScrollAreaAxis) => range(axis) > 1;
  const atStart = (axis: ScrollAreaAxis) => position()[axis] < 1;
  const atEnd = (axis: ScrollAreaAxis) => position()[axis] > range(axis) - 1;

  const context: ScrollAreaRootContextValue = {
    attributes: {
      get "data-scrolling"() {
        return flag(scrolling());
      },
      get "data-overflow-x"() {
        return flag(overflows("x"));
      },
      get "data-overflow-y"() {
        return flag(overflows("y"));
      },
      get "data-overflow-x-start"() {
        return flag(overflows("x") && !atStart("x"));
      },
      get "data-overflow-x-end"() {
        return flag(overflows("x") && !atEnd("x"));
      },
      get "data-overflow-y-start"() {
        return flag(overflows("y") && !atStart("y"));
      },
      get "data-overflow-y-end"() {
        return flag(overflows("y") && !atEnd("y"));
      },
    },
    observe: (element) => {
      (observer ??= new ResizeObserver(measure)).observe(element);
      return () => observer!.unobserve(element);
    },
    scrolled: () => {
      readPosition();
      setScrolling(true);
      clearTimeout(timer);
      timer = setTimeout(() => setScrolling(false), scrollingFor);
    },
    overflows,
    thumbSize: (axis) =>
      `${(size()[axis].viewport / size()[axis].content) * 100}%`,
    thumbPosition: (axis) => Math.min(1, position()[axis] / range(axis)),
    hidesSystem: () => canHide() && scrollbars() > 0,
    registerScrollbar: () => {
      setScrollbars((count) => count + 1);
      return () => setScrollbars((count) => count - 1);
    },
  };

  onSettled(() => {
    setCanHide(CSS.supports("scrollbar-width", "none"));
    return () => {
      observer?.disconnect();
      clearTimeout(timer);
    };
  });

  const elementProps = mergeElementProps(
    context.attributes,
    omit(props, "render"),
  );
  return (
    <ScrollAreaRootContext value={context}>
      {renderElement(props, elementProps, (p) => (
        <div {...p} />
      ))}
    </ScrollAreaRootContext>
  );
}
