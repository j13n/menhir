import { createEffect, createUniqueId, merge, omit, onCleanup } from "solid-js";

import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { RenderProp } from "../../core/renderElement.tsx";
import { trackSafeArea } from "../../floating/hover/safeArea.ts";
import { menuItemProps } from "../item/menuItemProps.ts";
import type { MenuItemBaseProps } from "../item/menuItemProps.ts";
import { useMenuContext } from "../root/MenuContext.ts";

export interface MenuSubmenuTriggerProps extends MenuItemBaseProps {
  render?: RenderProp;
}

/**
 * The item that opens a submenu: a `<div role="menuitem"
 * aria-haspopup="menu">` with `aria-expanded`, an item of the menu around
 * its `Menu.Submenu`. Right Arrow, Enter and Space open the submenu with
 * focus on its first item; the pointer resting on it, or a click, opens it
 * and leaves focus here. Place it inside `Menu.Submenu`, right before the
 * submenu's `Menu.Popup`.
 */
export function MenuSubmenuTrigger(props: MenuSubmenuTriggerProps) {
  const submenu = useMenuContext();
  // An item of the menu around the submenu.
  const parent = submenu.parent!;
  const generated = createUniqueId();
  // The consumer's `id`, else the generated one, which labels the submenu's
  // Popup rendered after it. Kept out of the merge ("`undefined` is a
  // value", PLAN.md section 8).
  const id = () => props.id ?? generated;
  submenu.triggerId = id;
  const itemProps = menuItemProps(parent, props, {
    role: "menuitem",
    onActivate: (event, key) => {
      const details = { reason: "trigger-press", event: key ?? event } as const;
      // A key moves focus into the submenu; a click leaves it here.
      if (key) submenu.openAtFirst(details);
      else submenu.setOpen(true, details);
    },
    submenu,
    ref: (element) => {
      submenu.trigger = element;
    },
  });
  // The pointer resting on the trigger opens the submenu after `delay`;
  // leaving the trigger and the submenu closes it, across the safe area
  // between them. Only a pointer that moves counts: a menu that opens
  // under a still pointer gets boundary events, and opens no submenu.
  let timer: ReturnType<typeof setTimeout> | undefined;
  let stopSafeArea: (() => void) | undefined;
  const cancel = () => {
    clearTimeout(timer);
    timer = undefined;
    stopSafeArea?.();
    stopSafeArea = undefined;
  };
  onCleanup(cancel);
  const close = (event: Event) => {
    const closeDelay = submenu.delays.closeDelay ?? 0;
    const details = { reason: "trigger-hover", event } as const;
    if (closeDelay > 0)
      timer = setTimeout(() => submenu.close(details), closeDelay);
    else submenu.close(details);
  };
  /** The pointer leaving `from` on its way to `to`, or elsewhere. */
  const leave = (event: PointerEvent, to: Element | undefined) => {
    cancel();
    if (event.pointerType === "touch" || !submenu.open()) return;
    if (to && event.relatedTarget)
      stopSafeArea = trackSafeArea(event, to, close);
    else close(event);
  };
  const hoverProps = {
    onPointerMove: (event: PointerEvent) => {
      // List navigation's move first: the trigger becomes the active item.
      (itemProps.onPointerMove as (event: PointerEvent) => void)(event);
      if (event.pointerType === "touch" || props.disabled) return;
      if (submenu.open()) {
        // Back on the trigger: no longer on its way anywhere.
        cancel();
        return;
      }
      if (timer) return;
      const details = { reason: "trigger-hover", event } as const;
      timer = setTimeout(() => {
        timer = undefined;
        submenu.setOpen(true, details);
      }, submenu.delays.delay ?? 100);
    },
    onPointerLeave: (event: PointerEvent) => leave(event, submenu.popup),
  };
  // While open, the pointer on the submenu keeps it open, and leaving it
  // closes it, unless on its way back to the trigger.
  createEffect(
    () => submenu.open(),
    (open) => {
      // Opened or closed, from here or elsewhere: a pending delay is moot.
      cancel();
      const popup = submenu.popup;
      if (!open || !popup) return;
      const enter = () => cancel();
      const exit = (event: PointerEvent) => leave(event, submenu.trigger);
      popup.addEventListener("pointerenter", enter);
      popup.addEventListener("pointerleave", exit);
      return () => {
        popup.removeEventListener("pointerenter", enter);
        popup.removeEventListener("pointerleave", exit);
      };
    },
  );
  const ownProps = merge(submenu.attributes, itemProps, hoverProps, {
    get id() {
      return id();
    },
    "aria-haspopup": "menu",
    get "aria-expanded"() {
      return submenu.open() ? "true" : "false";
    },
    "aria-controls": submenu.popupId,
  } as const);
  const elementProps = mergeElementProps(
    ownProps,
    omit(props, "render", "disabled", "label", "onClick", "id"),
  );
  return renderElement(props, elementProps, (p) => <div {...p} />);
}
