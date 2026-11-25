import type { JSX } from "@solidjs/web";
import { Show, createEffect, merge, omit, onSettled } from "solid-js";

import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { ElementProps, RenderProp } from "../../core/renderElement.tsx";
import { useScrollAreaRootContext } from "../root/ScrollAreaRootContext.ts";
import { ScrollAreaScrollbarContext } from "./ScrollAreaScrollbarContext.ts";
import type { ScrollAreaScrollbarContextValue } from "./ScrollAreaScrollbarContext.ts";

// How long a press on the track is held before it repeats, and how often
// it repeats, as Number Field's buttons do.
const holdDelay = 400;
const repeatInterval = 60;
// The share of the viewport a press on the track scrolls: a page less an
// eighth, so a line of context stays.
const pageFraction = 0.875;
// A wheel's delta in lines, as Firefox gives a mouse wheel's, in pixels.
const lineHeight = 16;

export interface ScrollAreaScrollbarProps extends JSX.HTMLAttributes<HTMLElement> {
  /** The axis it scrolls: `"vertical"` (the default) or `"horizontal"`. */
  orientation?: "vertical" | "horizontal";
  /** Renders the scrollbar with your own component. Read once. */
  render?: RenderProp;
}

/**
 * A scrollbar of the page's own for one axis: a `<div>` with the Thumb
 * inside, rendered while that axis overflows and the system's scrollbars
 * are hidden. It is `aria-hidden`: the Viewport is what assistive
 * technology and the keyboard reach. Place it inside `ScrollArea.Root`.
 */
export function ScrollAreaScrollbar(props: ScrollAreaScrollbarProps) {
  const root = useScrollAreaRootContext();
  const axis = () => (props.orientation === "horizontal" ? "x" : "y");
  const context: ScrollAreaScrollbarContextValue = {
    attributes: {
      get "data-vertical"() {
        return axis() === "y" ? ("" as const) : undefined;
      },
      get "data-horizontal"() {
        return axis() === "x" ? ("" as const) : undefined;
      },
    },
  };
  let bar: HTMLElement | undefined;
  // The pointer that presses, where it is along the axis, and, while it
  // drags the thumb, where the drag started and how far the viewport
  // scrolls for each pixel.
  let pointer: number | undefined;
  let pointerAt = 0;
  let drag: { from: number; scroll: number; ratio: number } | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;
  onSettled(() => {
    const unregister = root.registerScrollbar();
    return () => {
      unregister();
      clearTimeout(timer);
    };
  });

  const vertical = () => axis() === "y";
  const along = (event: PointerEvent) =>
    vertical() ? event.clientY : event.clientX;
  // An element's start and length along the axis, in the viewport.
  const box = (element: HTMLElement) => {
    const { top, left, height, width } = element.getBoundingClientRect();
    return vertical()
      ? { start: top, length: height }
      : { start: left, length: width };
  };
  // `scrollLeft` grows as the thumb moves right in both directions, from 0
  // left to right and up to 0 right to left, so physical pixels need no
  // case for right to left.
  const scroll = (viewport: HTMLElement) =>
    vertical() ? viewport.scrollTop : viewport.scrollLeft;
  const scrollTo = (viewport: HTMLElement, to: number) =>
    viewport.scrollTo({
      [vertical() ? "top" : "left"]: to,
      behavior: "instant",
    });
  const length = (viewport: HTMLElement) =>
    vertical() ? viewport.clientHeight : viewport.clientWidth;
  // One page towards the pointer, then again while held, until the thumb
  // is under it.
  const step = (delay: number) => {
    const viewport = root.viewport!;
    const thumb = box(context.thumb!);
    const direction =
      pointerAt < thumb.start
        ? -1
        : pointerAt > thumb.start + thumb.length
          ? 1
          : 0;
    if (!direction) return;
    scrollTo(
      viewport,
      scroll(viewport) + direction * length(viewport) * pageFraction,
    );
    timer = setTimeout(() => step(repeatInterval), delay);
  };
  const reset = () => {
    pointer = drag = undefined;
    clearTimeout(timer);
  };
  const end = (event: PointerEvent) => {
    if (event.pointerId === pointer) reset();
  };
  // Rendered while its axis overflows. Taken out under a press, it gets no
  // `pointerup` or `lostpointercapture`, so the press ends here.
  const shown = () => root.hidesSystem() && root.overflows(axis());
  createEffect(shown, (on) => {
    if (!on) reset();
  });

  const ownProps = merge(root.attributes, context.attributes, {
    "aria-hidden": "true",
    get style() {
      return {
        "--thumb-size": root.thumbSize(axis()),
        "--thumb-position": String(root.thumbPosition(axis())),
        // A touch drag on it moves the thumb, and does not scroll the page.
        "touch-action": "none",
      };
    },
    onPointerDown: (event: PointerEvent) => {
      const viewport = root.viewport;
      const thumb = context.thumb;
      if (event.button !== 0 || pointer !== undefined || !viewport || !thumb)
        return;
      // Nothing selected, and focus stays where it was.
      event.preventDefault();
      pointer = event.pointerId;
      // Captured, so the drag goes on outside the scrollbar.
      bar!.setPointerCapture(pointer);
      pointerAt = along(event);
      const track = box(bar!).length;
      const { start, length: size } = box(thumb);
      const ratio =
        ((vertical() ? viewport.scrollHeight : viewport.scrollWidth) -
          length(viewport)) /
        (track - size);
      const onThumb = thumb.contains(event.target as Node);
      if (!onThumb && !event.altKey && !event.shiftKey) return step(holdDelay);
      // With Alt or Shift, the thumb's centre jumps under the pointer, as
      // those keys switch the system's scrollbars to on macOS and Windows.
      if (!onThumb) {
        scrollTo(
          viewport,
          scroll(viewport) + (pointerAt - start - size / 2) * ratio,
        );
      }
      drag = { from: pointerAt, scroll: scroll(viewport), ratio };
    },
    onPointerMove: (event: PointerEvent) => {
      if (event.pointerId !== pointer) return;
      pointerAt = along(event);
      if (drag)
        scrollTo(
          root.viewport!,
          drag.scroll + (pointerAt - drag.from) * drag.ratio,
        );
    },
    onPointerUp: end,
    onPointerCancel: end,
    onLostPointerCapture: end,
    // The Scrollbar is beside the scroller, not in it, so the browser would
    // scroll the page for a wheel over it. Cancelled only if the viewport
    // moved, so at its end the page scrolls on.
    onWheel: (event: WheelEvent) => {
      const viewport = root.viewport!;
      // In pixels, lines or pages, each axis by its own page.
      const unit = (page: number) => [1, lineHeight, page][event.deltaMode]!;
      const { scrollTop, scrollLeft } = viewport;
      viewport.scrollBy({
        left: event.deltaX * unit(viewport.clientWidth),
        top: event.deltaY * unit(viewport.clientHeight),
        behavior: "instant",
      });
      if (
        viewport.scrollTop !== scrollTop ||
        viewport.scrollLeft !== scrollLeft
      )
        event.preventDefault();
    },
    ref: (element: HTMLElement) => {
      bar = element;
    },
  }) as ElementProps;
  const elementProps = mergeElementProps(
    ownProps,
    omit(props, "render", "orientation"),
  );
  return (
    <ScrollAreaScrollbarContext value={context}>
      <Show when={shown()}>
        {renderElement(props, elementProps, (p) => (
          <div {...p} />
        ))}
      </Show>
    </ScrollAreaScrollbarContext>
  );
}
