import { createContext, useContext } from "solid-js";
import { isDev } from "@solidjs/web";

import type { RovingFocus } from "../../core/rovingFocus.ts";

/** An item as the toolbar knows it, for focus order and the tab stop. */
export interface ToolbarItemEntry {
  readonly element: HTMLElement;
  /** Toolbar's `disabled`, which keeps the item focusable. */
  readonly disabled: () => boolean;
  /**
   * Whether the item keeps a key the toolbar would move focus with: one
   * toward the previous item (`step` -1), the next (1), or Home or End
   * (0). A text field's, for its caret.
   */
  keeps?(element: HTMLElement, step: number): boolean;
  /**
   * Called once an arrow key, Home or End has moved focus to the item,
   * `atEnd` when it came from the item's end side. A text field's, for
   * its caret.
   */
  enter?(element: HTMLElement, atEnd: boolean): void;
}

/** What the Root shares with its items. */
export interface ToolbarRootContextValue extends Pick<
  RovingFocus<ToolbarItemEntry>,
  "register" | "isTabStop"
> {
  /** Whether the whole toolbar is disabled. */
  disabled(): boolean | undefined;
  /**
   * Whether the item being created is the toolbar's first item that is not
   * disabled, or the first of a disabled toolbar, which has the tab stop
   * before any item has registered, as on the server. Called once per
   * item, in its body, untracked.
   */
  claimTabStop(disabled: boolean): boolean;
  /** Records the item that received focus, which takes the tab stop. */
  setActive(element: HTMLElement): void;
}

// `null` outside a Root, so that the part can name what is missing. Solid's
// own error for a context with no provider and no default does not.
export const ToolbarRootContext = createContext<ToolbarRootContextValue | null>(
  null,
);

export function useToolbarRootContext(): ToolbarRootContextValue {
  const context = useContext(ToolbarRootContext);
  // Production builds drop the check, and its message, with `isDev`.
  if (isDev && !context) {
    throw new Error(
      "[menhir] Toolbar parts must be placed within <Toolbar.Root>.",
    );
  }
  return context!;
}
