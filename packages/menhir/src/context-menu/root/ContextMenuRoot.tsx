import type { JSX } from "@solidjs/web";

import { MenuContext } from "../../menu/root/MenuContext.ts";
import type { MenuStateProps } from "../../menu/root/MenuContext.ts";
import { createContextMenu } from "./ContextMenuContext.ts";

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
  return (
    <MenuContext value={createContextMenu(props)}>{props.children}</MenuContext>
  );
}
