import { createContext, useContext } from "solid-js";
import { isDev } from "@solidjs/web";

import type { ToastRecord } from "../manager/createToastManager.ts";

/** What the Region shares with each Root. */
export interface ToastRegionContextValue {
  /**
   * Whether the timers wait: the pointer is on the Region, focus is inside
   * it, or the page is hidden.
   */
  paused(): boolean;
  /** A rendered toast's place from the front: 0 for the newest. */
  index(toast: ToastRecord): number;
  /**
   * Called with the element of a toast that has closed: moves focus out of
   * it if it holds focus, to the Region if a toast is left, else to where
   * focus was before it entered the Region.
   */
  release(toast: HTMLElement): void;
}

export const ToastRegionContext = createContext<ToastRegionContextValue | null>(
  null,
);

export function useToastRegionContext(): ToastRegionContextValue {
  const context = useContext(ToastRegionContext);
  // Production builds drop the check, and its message, with `isDev`.
  if (isDev && !context) {
    throw new Error(
      "[menhir] Toast.Root must be placed within <Toast.Region>.",
    );
  }
  return context!;
}
