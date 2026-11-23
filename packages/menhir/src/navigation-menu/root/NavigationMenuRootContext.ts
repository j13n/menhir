import { createContext, useContext } from "solid-js";
import { isDev } from "@solidjs/web";

import type { OpenChangeDetails } from "../../floating/dismissal/reason.ts";

/** What the Root shares with its Items and Links. */
export interface NavigationMenuRootContextValue {
  /** The open Item's value, `null` when none is open. */
  value(): string | null;
  /**
   * A press on the Item's Trigger: opens it, to stay open when the pointer
   * leaves, or closes it if it is open, counting a change asked for earlier
   * in the same turn.
   */
  toggle(item: string, event: MouseEvent): void;
  /** Hover asking to open the Item, closing any other. */
  hoverOpen(item: string, details: OpenChangeDetails): void;
  /**
   * Hover asking to close the Item, which closes it only if it is the one
   * open, counting a change asked for earlier in the same turn, and a press
   * did not open it: hover's close of the Item the pointer left must not
   * undo the opening of the next.
   */
  hoverClose(item: string, details: OpenChangeDetails): void;
  /** Asks to close whichever Item is open, saying why. */
  close(details: OpenChangeDetails): void;
  /**
   * How long the pointer rests on a Trigger it has just entered before its
   * Panel opens: 0 while an Item is open or within `timeout` of the last
   * close, else the Root's `delay`.
   */
  hoverDelay(): number;
  /** The Root's `closeDelay`. */
  closeDelay(): number;
}

// `null` outside a Root, so that the part can name what is missing. Solid's
// own error for a context with no provider and no default does not.
export const NavigationMenuRootContext =
  createContext<NavigationMenuRootContextValue | null>(null);

export function useNavigationMenuRootContext(
  part: string,
): NavigationMenuRootContextValue {
  const context = useContext(NavigationMenuRootContext);
  // Production builds drop the check, and its message, with `isDev`.
  if (isDev && !context) {
    throw new Error(
      `[menhir] NavigationMenu.${part} must be placed within <NavigationMenu.Root>.`,
    );
  }
  return context!;
}
