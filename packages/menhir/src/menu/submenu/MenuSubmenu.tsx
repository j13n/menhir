import type { JSX } from "@solidjs/web";

import {
  createMenu,
  MenuContext,
  useMenuContext,
} from "../root/MenuContext.ts";
import type { MenuStateProps } from "../root/MenuContext.ts";

export interface MenuSubmenuProps extends MenuStateProps {
  /**
   * How long the pointer rests on the trigger before the submenu opens, in
   * milliseconds. Default 100.
   */
  delay?: number;
  /**
   * How long after the pointer has left the trigger and the submenu it
   * closes, in milliseconds. Default 0: the safe area carries the pointer
   * across.
   */
  closeDelay?: number;
  children?: JSX.Element;
}

/**
 * A menu inside a menu: holds whether it is open and shares it with
 * `Menu.SubmenuTrigger` and the `Menu.Popup` right after it. Renders no
 * element of its own. Place it inside `Menu.Popup`.
 */
export function MenuSubmenu(props: MenuSubmenuProps) {
  const menu = createMenu(props, useMenuContext());
  return <MenuContext value={menu}>{props.children}</MenuContext>;
}
