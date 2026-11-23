import type { JSX } from "@solidjs/web";
import { merge, omit } from "solid-js";

import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { ElementProps, RenderProp } from "../../core/renderElement.tsx";
import { createPosition } from "../../floating/positioning/createPosition.ts";
import type {
  Align,
  Side,
  VirtualElement,
} from "../../floating/positioning/createPosition.ts";
import { flip } from "../../floating/positioning/flip.ts";
import { offset } from "../../floating/positioning/offset.ts";
import { shift } from "../../floating/positioning/shift.ts";
import { size } from "../../floating/positioning/size.ts";
import { createPresence } from "../../floating/presence/presence.ts";
import { useComboboxContext } from "../root/ComboboxContext.ts";

/** What the Popup is placed against: an element, or a virtual one. */
export type ComboboxAnchor = Element | VirtualElement;

export interface ComboboxPopupProps extends JSX.HTMLAttributes<HTMLElement> {
  /** The side of the anchor it is placed against. Default `"bottom"`. */
  side?: Side;
  /** Where along that side, following the writing direction. Default `"start"`. */
  align?: Align;
  /** The gap from the anchor, in pixels. Default 0. */
  sideOffset?: number;
  /** The shift along the anchor's side, in pixels. Default 0. */
  alignOffset?: number;
  /** The space kept from the viewport's edges, in pixels. Default 5. */
  collisionPadding?: number;
  /**
   * What it is placed against instead of the Input, such as a box around
   * the Input and the Trigger: an element, a virtual element, or a
   * function returning one.
   */
  anchor?: ComboboxAnchor | (() => ComboboxAnchor | undefined);
  render?: RenderProp;
}

/**
 * The box the list shows in: a `<div popover="manual">` in the top layer,
 * placed against the Input. It takes no focus: the input keeps it, and a
 * press in it moves none. Escape, focus leaving the input, the Trigger and
 * selecting an item close it. Its CSS variables `--anchor-width` and
 * `--available-height` are for its `min-width` and `max-height`. Place
 * `Combobox.List` inside it, and `Combobox.Status` or a `<Loading>`
 * fallback beside the List. Place it inside `Combobox.Root`.
 */
export function ComboboxPopup(props: ComboboxPopupProps) {
  const combobox = useComboboxContext();
  let popup: HTMLElement | undefined;
  // Presence first: the popover is shown before it is placed. A manual
  // popover: the browser would light-dismiss an `auto` one on a press in
  // the input, which is not its invoker (README, "Settled after Phase 2").
  createPresence({
    get popup() {
      return popup;
    },
    get open() {
      return combobox.open();
    },
  });
  createPosition({
    get anchor() {
      const anchor = props.anchor;
      return (
        (typeof anchor === "function" ? anchor() : anchor) ?? combobox.input
      );
    },
    get popup() {
      return popup;
    },
    get open() {
      return combobox.open();
    },
    get side() {
      return props.side ?? "bottom";
    },
    get align() {
      return props.align ?? "start";
    },
    get middleware() {
      const padding = props.collisionPadding ?? 5;
      return [
        offset({
          mainAxis: props.sideOffset ?? 0,
          alignmentAxis: props.alignOffset ?? 0,
        }),
        flip({ padding }),
        shift({ padding }),
        // A list is often longer than the space beside the input.
        size({ padding }),
      ];
    },
  });

  const ownProps = merge(combobox.attributes, {
    popover: "manual",
    // A press in the list would take focus from the input, which holds it
    // for the keys, and leaving it would close the list.
    onMouseDown: (event: MouseEvent) => event.preventDefault(),
    ref: (element: HTMLElement) => {
      popup = element;
    },
  } satisfies ElementProps);
  const elementProps = mergeElementProps(
    ownProps,
    omit(
      props,
      "render",
      "side",
      "align",
      "sideOffset",
      "alignOffset",
      "collisionPadding",
      "anchor",
    ),
  );
  return renderElement(props, elementProps, (p) => <div {...p} />);
}
