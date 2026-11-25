import { createContext, useContext } from "solid-js";
import { isDev } from "@solidjs/web";

import type {
  ToastCloseReason,
  ToastRecord,
} from "../manager/createToastManager.ts";

/**
 * The toast's state as `data-*` attributes, each `""` when it applies and
 * absent otherwise: one of `data-open` and `data-closed`. Every part merges
 * the same object, so its getters are read where each element uses them.
 */
export type ToastStateAttributes = {
  readonly "data-open": "" | undefined;
  readonly "data-closed": "" | undefined;
};

/** What the Root shares with its parts. */
export interface ToastRootContextValue {
  /** The toast this Root renders. */
  readonly toast: ToastRecord;
  /** Closes the toast, saying why. */
  close(reason: ToastCloseReason, event: Event): void;
  /**
   * Registers a mounted Action, so the toast does not leave by itself.
   * Returns what unregisters it, for the Action's disposal.
   */
  registerAction(): () => void;
  /** The `data-*` attributes every part carries. */
  readonly attributes: ToastStateAttributes;
}

export const ToastRootContext = createContext<ToastRootContextValue | null>(
  null,
);

export function useToastRootContext(): ToastRootContextValue {
  const context = useContext(ToastRootContext);
  // Production builds drop the check, and its message, with `isDev`.
  if (isDev && !context) {
    throw new Error("[menhir] Toast parts must be placed within <Toast.Root>.");
  }
  return context!;
}
