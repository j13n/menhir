import { isDev } from "@solidjs/web";
import { createContext, useContext } from "solid-js";

import type { OpenChangeDetails } from "../../floating/dismissal/reason.ts";
import type {
  ListItem,
  ListNavigation,
} from "../../floating/list-navigation/listNavigation.ts";
import type { Typeahead } from "../../floating/typeahead/typeahead.ts";
import type { Menu } from "../../menu/root/MenuContext.ts";

/** An item of the bar, a menu's Trigger, as its list navigation knows it. */
export interface MenubarItem extends ListItem {
  /** The menu the item opens. */
  readonly menu: Menu;
}

/** The bar: its items, the keys along it, and which of its menus is open. */
export interface Menubar {
  readonly list: ListNavigation<MenubarItem>;
  readonly typeahead: Typeahead;
  /**
   * Whether the item being created is the first, which has the tab stop of
   * the server HTML and of the first render.
   */
  claimTabStop(): boolean;
  /** The bar's open menu, if any. */
  openMenu(): Menu | undefined;
  /**
   * Once focus has moved to another item of the bar: if `open` was open,
   * closes it and opens that item's menu, with focus staying on the item.
   */
  follow(open: Menu | undefined, details: OpenChangeDetails): void;
  /** Moves focus to `item`, and opens its menu if another one was open. */
  moveTo(item: MenubarItem, details: OpenChangeDetails): void;
}

// `null` outside a Root, so that the part can name what is missing.
export const MenubarContext = createContext<Menubar | null>(null);

export function useMenubarContext(): Menubar {
  const context = useContext(MenubarContext);
  // Production builds drop the check, and its message, with `isDev`.
  if (isDev && !context) {
    throw new Error(
      "[menhir] Menubar parts must be placed within <Menubar.Root>.",
    );
  }
  return context!;
}
