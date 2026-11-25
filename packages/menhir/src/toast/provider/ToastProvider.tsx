import type { JSX } from "@solidjs/web";
import { untrack } from "solid-js";

import type {
  ToastManager,
  ToastManagerInternals,
} from "../manager/createToastManager.ts";
import { ToastProviderContext } from "./ToastProviderContext.ts";
import type { ToastProviderContextValue } from "./ToastProviderContext.ts";

export interface ToastProviderProps<T = unknown> {
  /** The list of toasts, from `createToastManager()`. Read once. */
  manager: ToastManager<T>;
  /**
   * How long a toast with no `duration` of its own stays, in milliseconds.
   * Default 5000.
   */
  duration?: number;
  /**
   * How many toasts are rendered at once: the rest wait, their time not
   * started, until one leaves. Default: no limit.
   */
  limit?: number;
  children?: JSX.Element;
}

/**
 * Hands the app's list of toasts to `Toast.Region` and its parts. Renders
 * no element of its own. Place it around the app, or around the Region
 * alone: code adds toasts through the manager, not through context.
 */
export function ToastProvider<T = unknown>(props: ToastProviderProps<T>) {
  const context: ToastProviderContextValue = {
    // As an event handler is: a Provider is one list's for life.
    manager: untrack(() => props.manager) as unknown as ToastManagerInternals,
    duration: () => props.duration ?? 5000,
    limit: () => props.limit,
  };
  return (
    <ToastProviderContext value={context}>
      {props.children}
    </ToastProviderContext>
  );
}
