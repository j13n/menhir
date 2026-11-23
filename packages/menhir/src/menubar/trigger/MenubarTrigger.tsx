import { merge, onSettled } from "solid-js";

import { callHandler } from "../../core/mergeElementProps.ts";
import type { Handler } from "../../core/mergeElementProps.ts";
import { useMenuContext } from "../../menu/root/MenuContext.ts";
import { MenuTrigger } from "../../menu/trigger/MenuTrigger.tsx";
import type { MenuTriggerProps } from "../../menu/trigger/MenuTrigger.tsx";
import { useMenubarContext } from "../root/MenubarContext.ts";
import type { MenubarItem } from "../root/MenubarContext.ts";

export type MenubarTriggerProps = MenuTriggerProps;

/**
 * An item of the bar, which opens its menu: Menu's `<button type="button"
 * aria-haspopup="menu">`, with the `menuitem` role and the bar's roving
 * `tabindex`. Down Arrow, Enter and Space open the menu with focus on its
 * first item, Up Arrow on its last. While a menu of the bar is open, moving
 * to another item, by a key or the pointer, opens that item's menu instead.
 * Place it inside `Menubar.Menu`, right before `Menubar.Popup`.
 */
export function MenubarTrigger(props: MenubarTriggerProps) {
  const bar = useMenubarContext();
  const menu = useMenuContext();
  // Its element is the menu's trigger, which Menu's Trigger sets.
  const item: MenubarItem = {
    get element() {
      return menu.trigger!;
    },
    menu,
  };
  // Read once: the tab stop of the server HTML, and of the first render.
  const first = bar.claimTabStop();
  onSettled(() => bar.list.register(item));
  return MenuTrigger(
    merge(props, {
      role: "menuitem" as const,
      // The item that last had focus, else the first (README, "Decisions").
      get tabindex() {
        const stop = bar.list.active() ?? bar.list.items()[0];
        return (stop ? stop === item : first) ? 0 : -1;
      },
      // Called here, not merged, so the consumer's handlers run too, first,
      // as in a merge.
      onFocus: (event: FocusEvent) => {
        callHandler(props.onFocus as Handler | undefined, event);
        if (bar.list.active() !== item) bar.list.move(item);
      },
      onKeyDown: (event: KeyboardEvent) => {
        callHandler(props.onKeyDown as Handler | undefined, event);
        const open = bar.openMenu();
        if (bar.typeahead.onKeyDown(event) || bar.list.onKeyDown(event)) {
          bar.follow(open, { reason: "arrow-key", event });
          return;
        }
        const { key } = event;
        if (event.altKey || event.ctrlKey || event.metaKey || !menu.open())
          return;
        // Tab leaves the bar, and closes its menu.
        if (key === "Tab") menu.close({ reason: "focus-out", event });
        // Enter and Space open the menu, which is open already: focus moves
        // into it, where Menu's Trigger would close it.
        if ((key === "Enter" || key === " ") && !event.shiftKey) {
          event.preventDefault();
          menu.list.move(menu.list.items()[0]);
        }
      },
      // While another menu of the bar is open, the pointer moving onto this
      // item opens its menu. Only a pointer that moves counts, and no touch.
      onPointerMove: (event: PointerEvent) => {
        callHandler(props.onPointerMove as Handler | undefined, event);
        const open = bar.openMenu();
        if (event.pointerType === "touch" || !open || open === menu) return;
        bar.moveTo(item, { reason: "trigger-hover", event });
        // A press it was on its way to keeps the menu open (README,
        // "Decisions").
        menu.hoverOpened = true;
      },
      onPointerLeave: (event: PointerEvent) => {
        callHandler(props.onPointerLeave as Handler | undefined, event);
        menu.hoverOpened = false;
      },
    }),
  );
}
