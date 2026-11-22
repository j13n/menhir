import type { JSX } from "@solidjs/web";
import { merge, omit } from "solid-js";

import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { ElementProps, RenderProp } from "../../core/renderElement.tsx";
import { createSlot } from "../../core/slot.ts";
import { createPosition } from "../../floating/positioning/createPosition.ts";
import type {
  Align,
  PositionMiddleware,
  Side,
  VirtualElement,
} from "../../floating/positioning/createPosition.ts";
import { flip } from "../../floating/positioning/flip.ts";
import { offset } from "../../floating/positioning/offset.ts";
import { shift } from "../../floating/positioning/shift.ts";
import { createPresence } from "../../floating/presence/presence.ts";
import { useTooltipRootContext } from "../root/TooltipRootContext.ts";
import { TooltipPopupContext } from "./TooltipPopupContext.ts";
import type { TooltipPopupContextValue } from "./TooltipPopupContext.ts";

/** What the Popup is placed against: an element, or a virtual one. */
export type TooltipAnchor = Element | VirtualElement;

// The Popup's `id` is the Root's, which the Trigger names before the Popup
// is rendered (PLAN.md section 8, "Generated ids belong to the root").
export interface TooltipPopupProps extends Omit<
  JSX.HTMLAttributes<HTMLElement>,
  "id"
> {
  /** The side of the anchor it is placed against. Default `"top"`. */
  side?: Side;
  /** Where along that side, following the writing direction. Default `"center"`. */
  align?: Align;
  /** The gap from the anchor, in pixels. Default 0. */
  sideOffset?: number;
  /** The shift along the anchor's side, in pixels. Default 0. */
  alignOffset?: number;
  /** The space kept from the viewport's edges, in pixels. Default 5. */
  collisionPadding?: number;
  /**
   * What it is placed against instead of the Trigger: an element, a virtual
   * element such as a point, or a function returning one, such as
   * `() => field` for an element reached through a ref.
   */
  anchor?: TooltipAnchor | (() => TooltipAnchor | undefined);
  render?: RenderProp;
}

/**
 * The tooltip itself: a `<div popover="manual" role="tooltip">` in the top
 * layer, placed against the Trigger, which it describes. It never takes
 * focus: put only text in it, and content a user must reach in a Popover.
 * Place it inside `Tooltip.Root`, after `Tooltip.Trigger`.
 */
export function TooltipPopup(props: TooltipPopupProps) {
  const root = useTooltipRootContext();
  const [arrow, registerArrow] = createSlot<PositionMiddleware>();
  // Presence first: the popover is shown before it is placed.
  createPresence({
    get popup() {
      return root.popup;
    },
    get open() {
      return root.open();
    },
  });
  const position = createPosition({
    get anchor() {
      const anchor = props.anchor;
      return (typeof anchor === "function" ? anchor() : anchor) ?? root.trigger;
    },
    get popup() {
      return root.popup;
    },
    get open() {
      return root.open();
    },
    get side() {
      return props.side ?? "top";
    },
    get align() {
      return props.align;
    },
    get middleware() {
      const padding = props.collisionPadding ?? 5;
      const middleware = [
        offset({
          mainAxis: props.sideOffset ?? 0,
          alignmentAxis: props.alignOffset ?? 0,
        }),
        flip({ padding }),
        shift({ padding }),
      ];
      // Only an app that renders an Arrow bundles its middleware.
      const arrowMiddleware = arrow();
      return arrowMiddleware ? [...middleware, arrowMiddleware] : middleware;
    },
  });

  const ownProps = merge(root.attributes, {
    id: root.popupId,
    popover: "manual",
    role: "tooltip",
    ref: (element: HTMLElement) => {
      root.popup = element;
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
      // Kept out, as typed: a stray one would break `aria-describedby`.
      "id" as keyof TooltipPopupProps,
    ),
  );
  const context: TooltipPopupContextValue = { position, registerArrow };
  return (
    <TooltipPopupContext value={context}>
      {renderElement(props, elementProps, (p) => (
        <div {...p} />
      ))}
    </TooltipPopupContext>
  );
}
