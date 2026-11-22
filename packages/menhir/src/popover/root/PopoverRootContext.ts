import { createContext, useContext } from "solid-js";
import { isDev } from "@solidjs/web";

import type { OpenChangeDetails } from "../../floating/dismissal/reason.ts";

/**
 * The popover's state as `data-*` attributes, each `""` when it applies and
 * absent otherwise: one of `data-open` and `data-closed`. Every part merges
 * the same object, so its getters are read where each element uses them.
 */
export type PopoverStateAttributes = {
  readonly "data-open": "" | undefined;
  readonly "data-closed": "" | undefined;
};

/** What the Root shares with its parts. */
export interface PopoverRootContextValue {
  /** Whether the popover is open. */
  open(): boolean;
  /** Asks to open or close the popover, saying why. */
  setOpen(open: boolean, details: OpenChangeDetails): void;
  /**
   * The Popup's `id`, which the Trigger names in `popovertarget` and
   * `aria-controls` before the Popup is rendered.
   */
  readonly popupId: string;
  /** The Trigger's element, once rendered: the anchor by default. */
  trigger: HTMLElement | undefined;
  /** The `id` of the rendered Title, which the Popup names, if any. */
  titleId(): string | undefined;
  /**
   * Registers the `id` of a mounted Title, as a getter. Returns what
   * unregisters it, for the Title's disposal.
   */
  registerTitleId(id: () => string | false): () => void;
  /** The `id` of the rendered Description, which the Popup names, if any. */
  descriptionId(): string | undefined;
  /** As `registerTitleId`, for the Description. */
  registerDescriptionId(id: () => string | false): () => void;
  /** The `data-*` attributes every part carries. */
  readonly attributes: PopoverStateAttributes;
}

// `null` outside a Root, so that the part can name what is missing. Solid's
// own error for a context with no provider and no default does not.
export const PopoverRootContext = createContext<PopoverRootContextValue | null>(
  null,
);

export function usePopoverRootContext(): PopoverRootContextValue {
  const context = useContext(PopoverRootContext);
  // Production builds drop the check, and its message, with `isDev`.
  if (isDev && !context) {
    throw new Error(
      "[menhir] Popover parts must be placed within <Popover.Root>.",
    );
  }
  return context!;
}
