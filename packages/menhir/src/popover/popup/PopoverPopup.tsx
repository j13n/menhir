import type { JSX } from "@solidjs/web";
import { merge, omit } from "solid-js";

import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { ElementProps, RenderProp } from "../../core/renderElement.tsx";
import { createSlot } from "../../core/slot.ts";
import { createPopoverClose } from "../../floating/dismissal/popoverClose.ts";
import type { OpenChangeDetails } from "../../floating/dismissal/reason.ts";
import { createInitialFocus } from "../../floating/focus/initialFocus.ts";
import { createReturnFocus } from "../../floating/focus/returnFocus.ts";
import type { FocusTarget } from "../../floating/focus/target.ts";
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
import { usePopoverRootContext } from "../root/PopoverRootContext.ts";
import { PopoverPopupContext } from "./PopoverPopupContext.ts";
import type { PopoverPopupContextValue } from "./PopoverPopupContext.ts";

/** What the Popup is placed against: an element, or a virtual one. */
export type PopoverAnchor = Element | VirtualElement;

// The Popup's `id` is the Root's, which the Trigger names before the Popup
// is rendered (PLAN.md section 8, "Generated ids belong to the root").
export interface PopoverPopupProps extends Omit<
  JSX.HTMLAttributes<HTMLElement>,
  "id"
> {
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
  anchor?: PopoverAnchor | (() => PopoverAnchor | undefined);
  /**
   * Where focus goes once the popover has opened, instead of the browser's
   * choice: the element with `autofocus`, else the Trigger, where it was.
   * An element, or a function called on each opening with the element the
   * browser focused inside, or `null`, such as `() => input`.
   */
  initialFocus?: FocusTarget;
  /**
   * Where focus goes once the popover has closed, instead of the Trigger,
   * where it returns when it was inside. An element, or a function called
   * with the element the browser focused, or `null` when it found none.
   */
  returnFocus?: FocusTarget;
  render?: RenderProp;
}

/**
 * The popover itself: a `<div popover="auto" role="dialog">` in the top
 * layer, placed against the Trigger. A press outside, Escape and the
 * Trigger close it; the page stays usable. Named by `Popover.Title` and
 * described by `Popover.Description` when they are rendered inside it.
 * Place it inside `Popover.Root`, right after `Popover.Trigger`, so that
 * Tab moves from the Trigger into it.
 */
export function PopoverPopup(props: PopoverPopupProps) {
  const root = usePopoverRootContext();
  let popup: HTMLElement | undefined;
  // Whether focus was inside as the popover closed, read on `beforetoggle`,
  // before the browser moves it.
  let focusInside = false;
  const [arrow, registerArrow] = createSlot<PositionMiddleware>();
  // What every module of the `floating` layer takes, as getters.
  const options = {
    get popup() {
      return popup;
    },
    get trigger() {
      return root.trigger;
    },
    get open() {
      return root.open();
    },
    onDismiss: (details: OpenChangeDetails) => root.setOpen(false, details),
    get initialFocus() {
      return props.initialFocus;
    },
    // The browser returns focus to the Trigger only for the first popover
    // of a stack (HTML standard), so a nested one left focus on the
    // `<body>`. A focus that left the popover before it closed stays.
    get returnFocus(): FocusTarget {
      return (
        props.returnFocus ??
        ((focused) =>
          (focused as HTMLElement | null) ??
          (focusInside ? root.trigger : undefined))
      );
    },
  };
  // Presence first: the popover is shown before it is placed.
  createPresence(options);
  createPopoverClose(options);
  createInitialFocus(options);
  createReturnFocus(options);
  const position = createPosition({
    get anchor() {
      const anchor = props.anchor;
      return (typeof anchor === "function" ? anchor() : anchor) ?? root.trigger;
    },
    get popup() {
      return popup;
    },
    get open() {
      return root.open();
    },
    get side() {
      return props.side;
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
    popover: "auto",
    role: "dialog",
    // The consumer's, else the Title's and Description's ids. Kept out of
    // the merge, where a wrapper's `aria-labelledby={undefined}` would
    // remove the Title's ("`undefined` is a value", PLAN.md section 8);
    // `false` removes it.
    get "aria-labelledby"() {
      return props["aria-labelledby"] ?? root.titleId();
    },
    get "aria-describedby"() {
      return props["aria-describedby"] ?? root.descriptionId();
    },
    onBeforeToggle: (event: ToggleEvent) => {
      focusInside =
        event.newState === "closed" && popup!.contains(document.activeElement);
    },
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
      "initialFocus",
      "returnFocus",
      "aria-labelledby",
      "aria-describedby",
      // Kept out, as typed: a stray one would break `popovertarget`.
      "id" as keyof PopoverPopupProps,
    ),
  );
  const context: PopoverPopupContextValue = { position, registerArrow };
  return (
    <PopoverPopupContext value={context}>
      {renderElement(props, elementProps, (p) => (
        <div {...p} />
      ))}
    </PopoverPopupContext>
  );
}
