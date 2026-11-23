import { createContext, useContext } from "solid-js";
import { isDev } from "@solidjs/web";

/**
 * An Item's state as `data-*` attributes, each `""` when it applies and
 * absent otherwise: one of `data-open` and `data-closed`. Every part of the
 * Item merges the same object, so its getters are read where each element
 * uses them.
 */
export type NavigationMenuItemStateAttributes = {
  readonly "data-open": "" | undefined;
  readonly "data-closed": "" | undefined;
};

/** What an Item shares with its Trigger and Panel. */
export interface NavigationMenuItemContextValue {
  /** Whether the Panel is shown. */
  open(): boolean;
  /** Asks to open or close the Panel by a press on the Trigger. */
  toggle(event: MouseEvent): void;
  /** The Panel's `id`, which the Trigger names in `aria-controls`. */
  readonly panelId: string;
  /** The Trigger's element, once rendered. */
  trigger: HTMLElement | undefined;
  /** The Panel's element, once rendered. */
  panel: HTMLElement | undefined;
  /** The `data-*` attributes every part of the Item carries. */
  readonly attributes: NavigationMenuItemStateAttributes;
}

// `null` outside an Item, so that the part can name what is missing.
export const NavigationMenuItemContext =
  createContext<NavigationMenuItemContextValue | null>(null);

export function useNavigationMenuItemContext(): NavigationMenuItemContextValue {
  const context = useContext(NavigationMenuItemContext);
  // Production builds drop the check, and its message, with `isDev`.
  if (isDev && !context) {
    throw new Error(
      "[menhir] NavigationMenu.Trigger and NavigationMenu.Panel must be placed within <NavigationMenu.Item>.",
    );
  }
  return context!;
}
