import { createContext, useContext } from "solid-js";
import { isDev } from "@solidjs/web";

/**
 * A checkbox or radio item's state as `data-*` attributes, each `""` when
 * it applies and absent otherwise: what the item and its
 * `Menu.ItemIndicator` carry.
 */
export type MenuItemIndicatorAttributes = {
  readonly "data-checked": "" | undefined;
  readonly "data-unchecked": "" | undefined;
};

// `null` outside a checkbox or radio item, so that the part can say so.
export const MenuItemIndicatorContext =
  createContext<MenuItemIndicatorAttributes | null>(null);

export function useMenuItemIndicatorContext(): MenuItemIndicatorAttributes {
  const context = useContext(MenuItemIndicatorContext);
  // Production builds drop the check, and its message, with `isDev`.
  if (isDev && !context) {
    throw new Error(
      "[menhir] Menu.ItemIndicator must be placed within <Menu.CheckboxItem> or <Menu.RadioItem>.",
    );
  }
  return context!;
}
