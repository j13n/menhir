import type { JSX } from "@solidjs/web";

import { createMenu, MenuContext } from "./MenuContext.ts";
import type { MenuStateProps } from "./MenuContext.ts";

export interface MenuRootProps extends MenuStateProps {
  children?: JSX.Element;
}

/**
 * A menu that a button opens: holds whether it is open and shares it with
 * `Menu.Trigger`, `Menu.Popup` and the items inside it. Renders no element
 * of its own.
 */
export function MenuRoot(props: MenuRootProps) {
  return <MenuContext value={createMenu(props)}>{props.children}</MenuContext>;
}
