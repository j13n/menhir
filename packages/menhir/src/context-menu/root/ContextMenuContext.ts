import { isDev } from "@solidjs/web";
import { useContext } from "solid-js";

import type { MenuAnchor } from "../../menu/popup/MenuPopup.tsx";
import { MenuContext } from "../../menu/root/MenuContext.ts";
import type { Menu } from "../../menu/root/MenuContext.ts";

/**
 * A context menu: Menu's state, plus where the menu was asked for, which
 * its Trigger sets and its Popup is placed against.
 */
export interface ContextMenu extends Menu {
  /**
   * The point of the last `contextmenu` from a pointer, or the element a
   * key's was fired at; `undefined` before the first.
   */
  anchor(): MenuAnchor | undefined;
  setAnchor(anchor: MenuAnchor): void;
  /** The Trigger's element, once rendered: the anchor before the first. */
  area: HTMLElement | undefined;
}

/** The Root's context menu, for its Trigger and its Popup. */
export function useContextMenu(): ContextMenu {
  const context = useContext(MenuContext) as ContextMenu | null;
  // Production builds drop the check, and its message, with `isDev`.
  if (isDev && !context?.setAnchor) {
    throw new Error(
      "[menhir] Context Menu parts must be placed within <ContextMenu.Root>.",
    );
  }
  return context!;
}
