import { createContext, useContext } from "solid-js";
import { isDev } from "@solidjs/web";

import type { OpenChangeDetails } from "../../floating/dismissal/reason.ts";

/**
 * The tooltip's state as `data-*` attributes, each `""` when it applies and
 * absent otherwise: one of `data-open` and `data-closed`. Every part merges
 * the same object, so its getters are read where each element uses them.
 */
export type TooltipStateAttributes = {
  readonly "data-open": "" | undefined;
  readonly "data-closed": "" | undefined;
};

/** What the Root shares with its parts. */
export interface TooltipRootContextValue {
  /** Whether the tooltip is open. */
  open(): boolean;
  /** Asks to open or close the tooltip, saying why. */
  setOpen(open: boolean, details: OpenChangeDetails): void;
  /**
   * The Popup's `id`, which the Trigger names in `aria-describedby` before
   * the Popup is rendered.
   */
  readonly popupId: string;
  /** The Trigger's element, once rendered: the anchor by default. */
  trigger: HTMLElement | undefined;
  /** The Popup's element, once rendered. */
  popup: HTMLElement | undefined;
  /**
   * Whether the Trigger was pressed since the pointer last entered it: hover
   * opens nothing until the pointer leaves and comes back.
   */
  pressed: boolean;
  /** The `data-*` attributes every part carries. */
  readonly attributes: TooltipStateAttributes;
}

// `null` outside a Root, so that the part can name what is missing. Solid's
// own error for a context with no provider and no default does not.
export const TooltipRootContext = createContext<TooltipRootContextValue | null>(
  null,
);

export function useTooltipRootContext(): TooltipRootContextValue {
  const context = useContext(TooltipRootContext);
  // Production builds drop the check, and its message, with `isDev`.
  if (isDev && !context) {
    throw new Error(
      "[menhir] Tooltip parts must be placed within <Tooltip.Root>.",
    );
  }
  return context!;
}
