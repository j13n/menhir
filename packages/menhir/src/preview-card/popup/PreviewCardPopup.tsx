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
import { usePreviewCardRootContext } from "../root/PreviewCardRootContext.ts";
import { PreviewCardPopupContext } from "./PreviewCardPopupContext.ts";
import type { PreviewCardPopupContextValue } from "./PreviewCardPopupContext.ts";

/** What the Popup is placed against: an element, or a virtual one. */
export type PreviewCardAnchor = Element | VirtualElement;

export interface PreviewCardPopupProps extends JSX.HTMLAttributes<HTMLElement> {
  /** The side of the anchor it is placed against. Default `"bottom"`. */
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
  anchor?: PreviewCardAnchor | (() => PreviewCardAnchor | undefined);
  render?: RenderProp;
}

/**
 * The card itself: a `<div popover="manual">` in the top layer, placed
 * against the Trigger. It takes no focus when it opens; Tab reaches what is
 * in it in the document's order. Inside a `<p>`, render it as a `<span>`.
 * Place it inside `PreviewCard.Root`, after `PreviewCard.Trigger`.
 */
export function PreviewCardPopup(props: PreviewCardPopupProps) {
  const root = usePreviewCardRootContext();
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
      return props.side ?? "bottom";
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
    popover: "manual",
    // Focus leaving the card for an element outside it and the Trigger
    // closes it, unless the pointer is on either (README, "Decisions").
    onFocusOut: (event: FocusEvent) =>
      root.closeOnFocusLeaving(event.relatedTarget, {
        reason: "focus-out",
        event,
      }),
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
    ),
  );
  const context: PreviewCardPopupContextValue = { position, registerArrow };
  return (
    <PreviewCardPopupContext value={context}>
      {renderElement(props, elementProps, (p) => (
        <div {...p} />
      ))}
    </PreviewCardPopupContext>
  );
}
