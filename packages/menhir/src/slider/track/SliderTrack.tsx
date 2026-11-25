import type { JSX } from "@solidjs/web";
import { merge, omit } from "solid-js";

import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { ElementProps, RenderProp } from "../../core/renderElement.tsx";
import { useSliderRootContext } from "../root/SliderRootContext.ts";

export interface SliderTrackProps extends JSX.HTMLAttributes<HTMLElement> {
  /** Renders the track as another element or component. Read once. */
  render?: RenderProp;
}

/**
 * The track: a `<div>`, the area where a press moves the thumb and a drag
 * follows the pointer. Place the Thumb inside it, inside `Slider.Root`.
 */
export function SliderTrack(props: SliderTrackProps) {
  const root = useSliderRootContext();
  let track: HTMLElement | undefined;
  // The pointer that drags, and how far from the thumb's centre it pressed,
  // along the track, so the thumb does not jump by a press off its centre.
  let pointer: number | undefined;
  let offset = 0;

  // How far along the track a point is, in pixels from where the range
  // starts: the left, the right when right to left, the bottom when
  // vertical. Read on each event, so the track may move or change size.
  const along = (x: number, y: number) => {
    const rect = track!.getBoundingClientRect();
    return root.props.orientation === "vertical"
      ? rect.bottom - y
      : getComputedStyle(track!).direction === "rtl"
        ? rect.right - x
        : x - rect.left;
  };
  const move = (event: PointerEvent) => {
    const rect = track!.getBoundingClientRect();
    const length =
      root.props.orientation === "vertical" ? rect.height : rect.width;
    root.change(
      root.min() +
        ((along(event.clientX, event.clientY) - offset) / length) *
          (root.max() - root.min()),
    );
  };
  const end = (event: PointerEvent) => {
    if (event.pointerId !== pointer) return;
    pointer = undefined;
    root.end();
  };

  const ownProps = merge(root.attributes, {
    // A touch drag moves the thumb, and neither scrolls nor zooms the page.
    style: { "touch-action": "none" },
    onPointerDown: (event: PointerEvent) => {
      if (event.button !== 0 || pointer !== undefined || root.props.disabled)
        return;
      // No text selection, and no focus on whatever was pressed: the
      // input takes it, so the keys go on from there.
      event.preventDefault();
      // Without a focus ring, as after a press on a native control. A
      // browser without the option shows one (PLAN.md section 5).
      root.input?.focus({ focusVisible: false });
      pointer = event.pointerId;
      // Captured, so the drag goes on outside the track.
      track!.setPointerCapture(pointer);
      const thumb = root.thumb;
      offset = 0;
      if (thumb?.contains(event.target as Node)) {
        const { left, top, width, height } = thumb.getBoundingClientRect();
        offset =
          along(event.clientX, event.clientY) -
          along(left + width / 2, top + height / 2);
      }
      root.begin();
      move(event);
    },
    onPointerMove: (event: PointerEvent) => {
      if (event.pointerId === pointer) move(event);
    },
    onPointerUp: end,
    onPointerCancel: end,
    onLostPointerCapture: end,
    ref: (element: HTMLElement) => {
      track = element;
    },
  }) as ElementProps;
  const elementProps = mergeElementProps(ownProps, omit(props, "render"));
  return renderElement(props, elementProps, (p) => <div {...p} />);
}
