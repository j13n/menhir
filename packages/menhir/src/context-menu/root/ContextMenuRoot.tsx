import type { JSX } from "@solidjs/web";
import { createSignal } from "solid-js";

import type { MenuAnchor } from "../../menu/popup/MenuPopup.tsx";
import { createMenu, MenuContext } from "../../menu/root/MenuContext.ts";
import type { MenuStateProps } from "../../menu/root/MenuContext.ts";
import type { ContextMenu } from "./ContextMenuContext.ts";

export interface ContextMenuRootProps extends MenuStateProps {
  children?: JSX.Element;
}

/**
 * A menu that an area opens with the `contextmenu` event: holds whether it
 * is open, and where it was asked for, and shares them with
 * `ContextMenu.Trigger`, `ContextMenu.Popup` and the items inside it.
 * Renders no element of its own.
 */
export function ContextMenuRoot(props: ContextMenuRootProps) {
  const [anchor, setAnchor] = createSignal<MenuAnchor>();
  // Added to Menu's state, not copied: its functions write to that object.
  const menu = createMenu(props) as ContextMenu;
  menu.anchor = anchor;
  menu.setAnchor = (value) => setAnchor(() => value);
  return <MenuContext value={menu}>{props.children}</MenuContext>;
}
