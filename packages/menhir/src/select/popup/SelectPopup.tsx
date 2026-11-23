import type { JSX } from "@solidjs/web";
import { createEffect, merge, omit } from "solid-js";

import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { ElementProps, RenderProp } from "../../core/renderElement.tsx";
import { createPopoverClose } from "../../floating/dismissal/popoverClose.ts";
import type { OpenChangeDetails } from "../../floating/dismissal/reason.ts";
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
import { useSelectContext } from "../root/SelectContext.ts";

/** What the Popup is placed against: an element, or a virtual one. */
export type SelectAnchor = Element | VirtualElement;

// The Popup's `id` is the Root's, which the Trigger names before the Popup
// is rendered (PLAN.md section 8, "Generated ids belong to the root").
export interface SelectPopupProps extends Omit<
  JSX.HTMLAttributes<HTMLElement>,
  "id"
> {
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
   * What it is placed against instead of the Trigger: an element, a virtual
   * element, or a function returning one.
   */
  anchor?: SelectAnchor | (() => SelectAnchor | undefined);
  render?: RenderProp;
}

/**
 * The list itself: a `<div popover="auto" role="listbox">` in the top
 * layer, placed against the Trigger and labelled by it. It takes no focus:
 * the Trigger keeps it. Escape, a press outside, Tab and selecting an item
 * close it. Its CSS variables `--anchor-width` and `--available-height`
 * are for its `min-width` and `max-height`. Place it inside `Select.Root`,
 * right after `Select.Trigger`.
 */
export function SelectPopup(props: SelectPopupProps) {
  const select = useSelectContext();
  let popup: HTMLElement | undefined;
  const options = {
    get popup() {
      return popup;
    },
    get trigger() {
      return select.trigger;
    },
    get open() {
      return select.open();
    },
    onDismiss: (details: OpenChangeDetails) => select.setOpen(false, details),
  };
  // Presence first: the popover is shown before it is placed.
  createPresence(options);
  createPopoverClose(options);
  // The item the list opens on is scrolled into view, as list navigation
  // scrolls one the keys move to: once the popover is shown, after its own
  // `showPopover()` in this flush, whichever effect runs first.
  createEffect(
    () => select.initial(),
    (item) => {
      if (item)
        queueMicrotask(() => item.element.scrollIntoView({ block: "nearest" }));
    },
  );
  createPosition({
    get anchor() {
      const anchor = props.anchor;
      return (
        (typeof anchor === "function" ? anchor() : anchor) ?? select.trigger
      );
    },
    get popup() {
      return popup;
    },
    get open() {
      return select.open();
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
        // A list is often longer than the space beside its Trigger.
        size({ padding }),
      ];
    },
  });

  const ownProps = merge(select.attributes, {
    id: select.popupId,
    popover: "auto",
    role: "listbox",
    // The consumer's, else the Trigger's id. Kept out of the merge, where a
    // wrapper's `aria-labelledby={undefined}` would remove the Trigger's
    // ("`undefined` is a value", PLAN.md section 8).
    get "aria-labelledby"() {
      return props["aria-labelledby"] ?? select.triggerId();
    },
    // A press in the list would take focus from the Trigger, which holds
    // it for the keys.
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
      "aria-labelledby",
      // Kept out, as typed: a stray one would break `popovertarget`.
      "id" as keyof SelectPopupProps,
    ),
  );
  return renderElement(props, elementProps, (p) => <div {...p} />);
}
