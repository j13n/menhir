import { isDev } from "@solidjs/web";
import { merge } from "solid-js";

import { callHandler } from "../../core/mergeElementProps.ts";
import type { Handler } from "../../core/mergeElementProps.ts";
import { MenuPopup } from "../../menu/popup/MenuPopup.tsx";
import type { MenuPopupProps } from "../../menu/popup/MenuPopup.tsx";
import { useMenuContext } from "../../menu/root/MenuContext.ts";
import { useContextMenu } from "../root/ContextMenuContext.ts";
import type { ContextMenu } from "../root/ContextMenuContext.ts";

export type ContextMenuPopupProps = MenuPopupProps;

/**
 * The menu itself: Menu's `<div popover="auto" role="menu">` in the top
 * layer, placed at the pointer, or below the element a key opened it from,
 * or the area before the first `contextmenu`. Name it with `aria-label`.
 * A `contextmenu` inside it is cancelled, so the browser's own menu does not
 * show over it. Place it inside `ContextMenu.Root`, right after
 * `ContextMenu.Trigger`, or inside `ContextMenu.Submenu`, right after
 * `ContextMenu.SubmenuTrigger`, where it is placed as in Menu.
 */
export function ContextMenuPopup(props: ContextMenuPopupProps) {
  const menu = useMenuContext() as ContextMenu;
  // The Root's Popup needs the Root's anchor. Production builds drop the
  // check with `isDev`.
  if (isDev && !menu.parent) useContextMenu();
  return MenuPopup(
    merge(props, {
      // The consumer's, else, for the Root's menu, where it was asked for.
      get anchor() {
        return (
          props.anchor ??
          (menu.parent ? undefined : () => menu.anchor() ?? menu.area)
        );
      },
      // A right-click, or the Menu key on a focused item, inside the menu
      // (README, "Decisions"). Called here, not merged, so the consumer's
      // handler runs too.
      onContextMenu: (event: MouseEvent) => {
        event.preventDefault();
        callHandler(props.onContextMenu as Handler | undefined, event);
      },
    }),
  );
}
