import { isDev } from "@solidjs/web";
import { createContext, createUniqueId, onCleanup, useContext } from "solid-js";

import { createControllableSignal } from "../../core/createControllableSignal.ts";
import type { OpenChangeDetails } from "../../floating/dismissal/reason.ts";
import type {
  ListItem,
  ListNavigation,
} from "../../floating/list-navigation/listNavigation.ts";
import { createRovingList } from "../../floating/list-navigation/roving.ts";
import { createTypeahead } from "../../floating/typeahead/typeahead.ts";
import type { Typeahead } from "../../floating/typeahead/typeahead.ts";

/**
 * A menu's state as `data-*` attributes, each `""` when it applies and
 * absent otherwise: one of `data-open` and `data-closed`.
 */
export type MenuStateAttributes = {
  readonly "data-open": "" | undefined;
  readonly "data-closed": "" | undefined;
};

/** An item of a menu, as its list navigation knows it. */
export interface MenuItemEntry extends ListItem {
  /** The submenu a SubmenuTrigger opens. */
  readonly submenu?: Menu;
  /** Whether the item is disabled, which opens no submenu. */
  readonly disabled?: boolean;
}

/**
 * One menu: the Root's, or a Submenu's. Its Popup, items and trigger share
 * it through context.
 */
export interface Menu {
  /** Whether the menu is open. */
  open(): boolean;
  /** Asks to open or close this menu, saying why. */
  setOpen(open: boolean, details: OpenChangeDetails): void;
  /**
   * Closes this menu and its open submenus. `cascade` marks a submenu
   * closed with the menu around it.
   */
  close(details: OpenChangeDetails, cascade?: boolean): void;
  /** Closes the open submenus of this menu, keeping it open. */
  closeSubmenus(details: OpenChangeDetails): void;
  /** Closes every menu, from the Root's down, as an activated item does. */
  closeAll(details: OpenChangeDetails): void;
  /**
   * Opens the menu with focus on its first item: from a key, or from a
   * Context Menu's `contextmenu`, which a pointer fires too.
   */
  openAtFirst(details: OpenChangeDetails): void;
  /** The menu around a submenu; `undefined` for the Root's. */
  readonly parent: Menu | undefined;
  /**
   * The submenus inside this menu, closed with it and by the keys that move
   * through it. Not reactive: read only when closing.
   */
  readonly submenus: Set<Menu>;
  readonly list: ListNavigation<MenuItemEntry>;
  readonly typeahead: Typeahead;
  /**
   * The Popup's `id`, which the trigger names in `popovertarget` or
   * `aria-controls` before the Popup is rendered.
   */
  readonly popupId: string;
  /** The trigger's `id`, which labels the Popup; set by the trigger. */
  triggerId(): string | false | undefined;
  /** The trigger's element, once rendered: the anchor by default. */
  trigger: HTMLElement | undefined;
  /** A submenu's trigger, as an item of its parent menu. */
  triggerItem: MenuItemEntry | undefined;
  /** The Popup's element, once rendered. */
  popup: HTMLElement | undefined;
  /**
   * Whether focus was inside the Popup when this menu began to close with
   * its submenus: hiding them first moves focus out before the Popup's
   * own `beforetoggle`, which reads it.
   */
  focusWasInside: boolean;
  /**
   * Whether the next opening leaves focus where it is, instead of on the
   * first item: set by a menubar before it opens a menu by moving along
   * the bar or by hover, and cleared once the menu has opened, or by the
   * menubar once the opening has been refused.
   */
  keepFocus: boolean;
  /**
   * Whether hover opened this menu and the pointer is still on its
   * trigger: a press there then keeps it open and moves focus into it,
   * where a press on an open menu's trigger closes it. Set by a menubar.
   */
  hoverOpened: boolean;
  /**
   * Set by a menubar on each of its menus: moves along the bar, `1` to the
   * next item and `-1` to the previous, from the key that points into an
   * item with no submenu, or out of the menu.
   */
  along?: (step: 1 | -1, event: KeyboardEvent) => void;
  /** The `data-*` attributes of the trigger and the Popup. */
  readonly attributes: MenuStateAttributes;
  /** A submenu's hover delays, from `Menu.Submenu`. */
  readonly delays: MenuDelayProps;
}

/** The hover delays of `Menu.Submenu`, in milliseconds. */
export interface MenuDelayProps {
  readonly delay?: number;
  readonly closeDelay?: number;
}

/** The state props of `Menu.Root` and `Menu.Submenu`. */
export interface MenuStateProps {
  /** Whether the menu is open, when controlled. */
  open?: boolean;
  /** Whether the menu is open at first, when uncontrolled. */
  defaultOpen?: boolean;
  /**
   * Called with the new value, and why, when the user opens or closes the
   * menu. When controlled, the menu changes only if `open` does.
   */
  onOpenChange?: (open: boolean, details: OpenChangeDetails) => void;
}

/**
 * Creates a menu's state, its list navigation and its typeahead. A submenu
 * passes its `parent`, which closes it with itself.
 */
export function createMenu(
  props: MenuStateProps & MenuDelayProps,
  parent?: Menu,
): Menu {
  const [open, setOpen] = createControllableSignal<boolean, OpenChangeDetails>({
    get value() {
      return props.open;
    },
    get defaultValue() {
      return props.defaultOpen ?? false;
    },
    onChange: (value, details) => props.onOpenChange?.(value, details),
  });
  const submenus = new Set<Menu>();
  const list = createRovingList<MenuItemEntry>({
    get open() {
      return open();
    },
    // A menu is short: the pattern allows wrapping (README, "Decisions").
    wrap: true,
    onArrowIn: (item, event) => {
      event.preventDefault();
      if (item.submenu) {
        if (!item.disabled)
          item.submenu.openAtFirst({ reason: "arrow-key", event });
        return;
      }
      // Right Arrow on an item with no submenu moves along a menubar, from
      // any depth, and does nothing in a menu that a button opened (menu
      // and menubar pattern).
      let root = menu;
      while (root.parent) root = root.parent;
      root.along?.(1, event);
    },
    // Left Arrow closes a submenu; in a menubar's menu it moves along the
    // bar, and in a Root's menu it does nothing.
    onArrowOut: (_item, event) => {
      if (!parent) {
        menu.along?.(-1, event);
        return;
      }
      event.preventDefault();
      menu.close({ reason: "arrow-key", event });
      parent.list.move(menu.triggerItem);
    },
  });
  const typeahead = createTypeahead<MenuItemEntry>({
    get open() {
      return open();
    },
    get items() {
      return list.items();
    },
    get active() {
      return list.active();
    },
    move: (item) => list.move(item),
  });
  const menu: Menu = {
    open,
    setOpen,
    close: (details, cascade) => {
      if (!cascade)
        menu.focusWasInside = !!menu.popup?.contains(document.activeElement);
      for (const submenu of submenus) submenu.close(details, true);
      setOpen(false, details);
    },
    closeSubmenus: (details) => {
      for (const submenu of submenus) submenu.close(details);
    },
    closeAll: (details) =>
      parent ? parent.closeAll(details) : menu.close(details),
    openAtFirst: (details) => {
      setOpen(true, details);
      // While closed, the move waits for the menu to open (list navigation).
      list.move(list.items()[0]);
    },
    parent,
    submenus,
    list,
    typeahead,
    popupId: createUniqueId(),
    triggerId: () => undefined,
    trigger: undefined,
    triggerItem: undefined,
    popup: undefined,
    focusWasInside: false,
    keepFocus: false,
    hoverOpened: false,
    delays: props,
    attributes: {
      get "data-open"() {
        return open() ? "" : undefined;
      },
      get "data-closed"() {
        return open() ? undefined : "";
      },
    },
  };
  if (parent) {
    parent.submenus.add(menu);
    onCleanup(() => parent.submenus.delete(menu));
  }
  return menu;
}

// `null` outside a Root, so that the part can name what is missing.
export const MenuContext = createContext<Menu | null>(null);

export function useMenuContext(): Menu {
  const context = useContext(MenuContext);
  // Production builds drop the check, and its message, with `isDev`.
  if (isDev && !context) {
    throw new Error(
      "[menhir] Menu parts must be placed within <Menu.Root>, Context Menu parts within <ContextMenu.Root>, and Menubar parts within <Menubar.Menu>.",
    );
  }
  return context!;
}
