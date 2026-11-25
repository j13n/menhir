import { createContext, useContext } from "solid-js";
import { isDev } from "@solidjs/web";

import type { ToastManagerInternals } from "../manager/createToastManager.ts";

/** What the Provider shares with the parts. */
export interface ToastProviderContextValue {
  readonly manager: ToastManagerInternals;
  /** How long a toast with no `duration` of its own stays, in milliseconds. */
  duration(): number;
  /** How many toasts are rendered at once, if limited. */
  limit(): number | undefined;
}

// `null` outside a Provider, so that the part can name what is missing.
export const ToastProviderContext =
  createContext<ToastProviderContextValue | null>(null);

export function useToastProviderContext(): ToastProviderContextValue {
  const context = useContext(ToastProviderContext);
  // Production builds drop the check, and its message, with `isDev`.
  if (isDev && !context) {
    throw new Error(
      "[menhir] Toast parts must be placed within <Toast.Provider>.",
    );
  }
  return context!;
}
