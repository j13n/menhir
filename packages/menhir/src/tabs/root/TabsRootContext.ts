import { createContext, useContext } from "solid-js";
import { isDev } from "@solidjs/web";

import type { RovingFocus } from "../../core/rovingFocus.ts";

/** A tab as the Root knows it, for focus order and the tab stop. */
export interface TabsTabEntry {
  readonly element: HTMLElement;
  readonly value: () => string;
}

/**
 * What the Root shares with its List, Tabs and Panels, with the tabs' roving
 * focus.
 */
export interface TabsRootContextValue extends RovingFocus<TabsTabEntry> {
  /** Whether the tab with this value is selected. */
  selected(value: string): boolean;
  /** Asks to select the tab with this value. */
  select(value: string): void;
  /**
   * Records the tab being created as the one selected when neither `value`
   * nor `defaultValue` is passed, if it is the first enabled one. Called
   * once per tab, in its body, before anything reads the selection.
   */
  claimFirst(value: string, disabled: boolean): void;
  /** Whether the List is vertical. */
  vertical(): boolean;
  /** Whether a tab is selected when it receives focus. */
  automatic(): boolean;
  /** The generated id of the tab with this value. */
  generatedTabId(value: string): string;
  /**
   * The id of the tab with this value, which its Panel names: the one the
   * tab handed over, else the generated one.
   */
  tabId(value: string): string | false;
  /**
   * The tabs' ids by value, each of which may be the consumer's: a tab
   * hands its id to its Panel, created after it, here.
   */
  readonly tabIds: Record<string, () => string | false>;
  /** The id of the Panel with this value, which its tab names. */
  panelId(value: string): string;
  /**
   * Records the tab that has focus, or none. While a tab has focus it has
   * the tab stop, so Tab from it moves to the panel.
   */
  setFocused(element: HTMLElement | undefined): void;
}

// `null` outside a Root, so that the part can name what is missing. Solid's
// own error for a context with no provider and no default does not.
export const TabsRootContext = createContext<TabsRootContextValue | null>(null);

export function useTabsRootContext(): TabsRootContextValue {
  const context = useContext(TabsRootContext);
  // Production builds drop the check, and its message, with `isDev`.
  if (isDev && !context) {
    throw new Error("[menhir] Tabs parts must be placed within <Tabs.Root>.");
  }
  return context!;
}
