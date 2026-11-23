import { omit } from "solid-js";

import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { RenderProp } from "../../core/renderElement.tsx";
import { useMenuContext } from "../root/MenuContext.ts";
import { menuItemProps } from "./menuItemProps.ts";
import type { MenuItemBaseProps } from "./menuItemProps.ts";

export interface MenuItemProps extends MenuItemBaseProps {
  render?: RenderProp;
}

/**
 * An action in the menu: a `<div role="menuitem">`. A click, Enter or
 * Space calls its `onClick` and closes every open menu; a disabled item
 * does neither. Render a link with `render`. Place it inside `Menu.Popup`.
 */
export function MenuItem(props: MenuItemProps) {
  const menu = useMenuContext();
  const ownProps = menuItemProps(menu, props, {
    role: "menuitem",
    onActivate: (event, key) =>
      menu.closeAll({ reason: "item-press", event: key ?? event }),
  });
  // The consumer's `onClick` is called by the item, not by the merge, so a
  // disabled item does not call it.
  const elementProps = mergeElementProps(
    ownProps,
    omit(props, "render", "disabled", "label", "onClick"),
  );
  return renderElement(props, elementProps, (p) => <div {...p} />);
}
