import { createContext, useContext } from "solid-js";
import { isDev } from "@solidjs/web";

import type { RovingFocus } from "../../core/rovingFocus.ts";

/** An item as the group knows it, for focus order and the tab stop. */
export interface ToggleGroupItemEntry {
  readonly element: HTMLElement;
  readonly disabled: () => boolean;
}

/** What the group shares with its items, with their roving focus. */
export interface ToggleGroupRootContextValue extends RovingFocus<ToggleGroupItemEntry> {
  /** Whether the item with this value is pressed. */
  pressed(value: string): boolean;
  /** Asks to press or release the item with this value. */
  press(value: string, pressed: boolean): void;
  /** Whether the whole group is disabled. */
  disabled(): boolean | undefined;
  /**
   * Whether the item being created is the group's first enabled item, which
   * has the tab stop before any item has registered, as on the server.
   * Called once per item, in its body.
   */
  claimTabStop(disabled: boolean): boolean;
  /** Records the item that received focus, which takes the tab stop. */
  setActive(element: HTMLElement): void;
}

// `null` outside a Root, so that the part can name what is missing. Solid's
// own error for a context with no provider and no default does not.
export const ToggleGroupRootContext =
  createContext<ToggleGroupRootContextValue | null>(null);

export function useToggleGroupRootContext(): ToggleGroupRootContextValue {
  const context = useContext(ToggleGroupRootContext);
  // Production builds drop the check, and its message, with `isDev`.
  if (isDev && !context) {
    throw new Error(
      "[menhir] ToggleGroup parts must be placed within <ToggleGroup.Root>.",
    );
  }
  return context!;
}
