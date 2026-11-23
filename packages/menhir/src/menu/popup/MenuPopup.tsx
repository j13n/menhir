import type { JSX } from "@solidjs/web";
import { createEffect, merge, omit, untrack } from "solid-js";

import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { ElementProps, RenderProp } from "../../core/renderElement.tsx";
import { createPopoverClose } from "../../floating/dismissal/popoverClose.ts";
import type { OpenChangeDetails } from "../../floating/dismissal/reason.ts";
import { createReturnFocus } from "../../floating/focus/returnFocus.ts";
import type { FocusTarget } from "../../floating/focus/target.ts";
import { createPosition } from "../../floating/positioning/createPosition.ts";
import type {
  Align,
  Side,
  VirtualElement,
} from "../../floating/positioning/createPosition.ts";
import { flip } from "../../floating/positioning/flip.ts";
import { offset } from "../../floating/positioning/offset.ts";
import { shift } from "../../floating/positioning/shift.ts";
import { createPresence } from "../../floating/presence/presence.ts";
import { useMenuContext } from "../root/MenuContext.ts";

/** What the Popup is placed against: an element, or a virtual one. */
export type MenuAnchor = Element | VirtualElement;

// The Popup's `id` is its menu's, which the trigger names before the Popup
// is rendered (PLAN.md section 8, "Generated ids belong to the root").
export interface MenuPopupProps extends Omit<
  JSX.HTMLAttributes<HTMLElement>,
  "id"
> {
  /**
   * The side of the anchor it is placed against. Default `"bottom"`, and
   * for a submenu the inline end: `"right"`, or `"left"` right to left.
   */
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
   * What it is placed against instead of its trigger: an element, a virtual
   * element such as a point, or a function returning one.
   */
  anchor?: MenuAnchor | (() => MenuAnchor | undefined);
  /**
   * Where focus goes once the menu has closed, instead of its trigger,
   * where it returns when it was inside. An element, or a function called
   * with the element the browser focused, or `null` when it found none.
   */
  returnFocus?: FocusTarget;
  render?: RenderProp;
}

/**
 * The menu itself: a `<div popover="auto" role="menu">` in the top layer,
 * placed against its trigger and labelled by it. Escape, a press outside,
 * Tab and activating an item close it. Place it inside `Menu.Root`, right
 * after `Menu.Trigger`, or inside `Menu.Submenu`, right after
 * `Menu.SubmenuTrigger`.
 */
export function MenuPopup(props: MenuPopupProps) {
  const menu = useMenuContext();
  let popup: HTMLElement | undefined;
  // Whether focus was inside as the menu closed, read on `beforetoggle`,
  // before the browser moves it.
  let focusInside = false;
  // The Tab key of this task, which closes every menu once focus has left
  // (README, "Decisions"). A timer forgets it.
  let tab: KeyboardEvent | undefined;
  const options = {
    get popup() {
      return popup;
    },
    get trigger() {
      return menu.trigger;
    },
    get open() {
      return menu.open();
    },
    onDismiss: (details: OpenChangeDetails) => menu.close(details),
    // The browser returns focus to the trigger only for the first popover
    // of a stack (HTML standard), so a submenu left focus on the `<body>`.
    // A focus that left the menu before it closed stays.
    get returnFocus(): FocusTarget {
      return (
        props.returnFocus ??
        ((focused) =>
          (focused as HTMLElement | null) ??
          (focusInside ? menu.trigger : undefined))
      );
    },
  };
  // Presence first: the popover is shown before it is placed and focused.
  createPresence(options);
  createPopoverClose(options);
  createReturnFocus(options);
  // Focus goes to the first item whenever the Root's menu opens, unless the
  // Trigger's Up Arrow chose the last, or a menubar keeps it on the bar. A
  // submenu opened by hover leaves it on its trigger (README, "Decisions").
  if (!menu.parent)
    createEffect(
      // The items register once mounted, after a `defaultOpen` menu opens.
      () => menu.open() && menu.list.items()[0],
      (first) => {
        if (!first) return;
        if (!menu.keepFocus && !untrack(menu.list.active))
          untrack(() => menu.list.move(first));
        menu.keepFocus = false;
      },
    );
  createPosition({
    get anchor() {
      const anchor = props.anchor;
      return (typeof anchor === "function" ? anchor() : anchor) ?? menu.trigger;
    },
    get popup() {
      return popup;
    },
    get open() {
      return menu.open();
    },
    get side(): Side {
      if (props.side) return props.side;
      if (!menu.parent) return "bottom";
      // A submenu opens toward the inline end of its trigger.
      const trigger = menu.trigger;
      return trigger && getComputedStyle(trigger).direction === "rtl"
        ? "left"
        : "right";
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
      ];
    },
  });

  const ownProps = merge(menu.attributes, {
    id: menu.popupId,
    popover: "auto",
    role: "menu",
    // The consumer's, else the trigger's id. Kept out of the merge, where a
    // wrapper's `aria-labelledby={undefined}` would remove the trigger's
    // ("`undefined` is a value", PLAN.md section 8).
    get "aria-labelledby"() {
      return props["aria-labelledby"] ?? menu.triggerId();
    },
    onBeforeToggle: (event: ToggleEvent) => {
      if (event.target !== popup) return;
      focusInside =
        event.newState === "closed" &&
        (menu.focusWasInside || popup!.contains(document.activeElement));
      menu.focusWasInside = false;
    },
    // A submenu's keys and focus bubble through the Root's Popup, which
    // holds them: Tab out of any menu closes every menu.
    onKeyDown: (event: KeyboardEvent) => {
      if (menu.parent || event.key !== "Tab") return;
      const noted = (tab = event);
      setTimeout(() => {
        if (tab === noted) tab = undefined;
      });
    },
    // Tab and Shift+Tab leave the menu that has focus: out of the Root's
    // menu, or from a submenu back to its trigger, which keeps the parent's
    // tab stop. Either closes every menu, as the pattern says.
    onFocusOut: (event: FocusEvent) => {
      const left = (event.target as Element).closest("[popover]");
      if (
        !tab ||
        menu.parent ||
        left?.contains(event.relatedTarget as Node | null)
      )
        return;
      tab = undefined;
      menu.close({ reason: "focus-out", event });
      // Shift+Tab from a submenu lands on its trigger, inside the menu that
      // closes: focus goes on to the Trigger, where it leaves the menu.
      if (popup!.contains(event.relatedTarget as Node | null))
        menu.trigger?.focus();
    },
    ref: (element: HTMLElement) => {
      popup = element;
      menu.popup = element;
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
      "returnFocus",
      "aria-labelledby",
      // Kept out, as typed: a stray one would break `popovertarget`.
      "id" as keyof MenuPopupProps,
    ),
  );
  return renderElement(props, elementProps, (p) => <div {...p} />);
}
