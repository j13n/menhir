import type { JSX } from "@solidjs/web";

import { createMenu, MenuContext } from "../../menu/root/MenuContext.ts";
import type { MenuStateProps } from "../../menu/root/MenuContext.ts";
import { useMenubarContext } from "../root/MenubarContext.ts";

export interface MenubarMenuProps extends MenuStateProps {
  children?: JSX.Element;
}

/**
 * One menu of the bar: holds whether it is open and shares it with its
 * `Menubar.Trigger`, `Menubar.Popup` and the items inside it. Renders no
 * element of its own. Place it inside `Menubar.Root`.
 */
export function MenubarMenu(props: MenubarMenuProps) {
  const bar = useMenubarContext();
  const menu = createMenu(props);
  // Right Arrow on an item with no submenu, and Left Arrow in this menu,
  // open the next or previous item's menu, with focus on that item. In a
  // bar of one menu they do nothing.
  menu.along = (step, event) => {
    const items = bar.list.items();
    const index = items.findIndex((item) => item.menu === menu);
    const to = items[(index + step + items.length) % items.length];
    if (!to || to.menu === menu) return;
    event.preventDefault();
    bar.moveTo(to, { reason: "arrow-key", event });
  };
  return <MenuContext value={menu}>{props.children}</MenuContext>;
}
