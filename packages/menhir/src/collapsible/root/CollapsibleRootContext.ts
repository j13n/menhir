import { createContext, useContext } from "solid-js";
import { isDev } from "@solidjs/web";

/**
 * The collapsible's state as `data-*` attributes, each `""` when it applies
 * and absent otherwise: one of `data-open` and `data-closed`, and
 * `data-disabled`. Every part merges the same object, so its getters are
 * read where each element uses them.
 */
export type CollapsibleStateAttributes = {
  readonly "data-open": "" | undefined;
  readonly "data-closed": "" | undefined;
  readonly "data-disabled": "" | undefined;
};

/** What the Root shares with its parts. */
export interface CollapsibleRootContextValue {
  /** Whether the Panel is shown. */
  open(): boolean;
  /** Asks to show or hide the Panel. */
  setOpen(open: boolean): void;
  /** Whether the Trigger ignores the user. */
  disabled(): boolean | undefined;
  /** The Panel's `id`, which the Trigger names in `aria-controls`. */
  readonly panelId: string;
  /** The `data-*` attributes every part carries. */
  readonly attributes: CollapsibleStateAttributes;
}

// `null` outside a Root, so that the part can name what is missing. Solid's
// own error for a context with no provider and no default does not.
export const CollapsibleRootContext =
  createContext<CollapsibleRootContextValue | null>(null);

export function useCollapsibleRootContext(): CollapsibleRootContextValue {
  const context = useContext(CollapsibleRootContext);
  // Production builds drop the check, and its message, with `isDev`.
  if (isDev && !context) {
    throw new Error(
      "[menhir] Collapsible parts must be placed within <Collapsible.Root>.",
    );
  }
  return context!;
}
