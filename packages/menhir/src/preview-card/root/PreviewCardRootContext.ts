import { createContext, useContext } from "solid-js";
import { isDev } from "@solidjs/web";

import type { OpenChangeDetails } from "../../floating/dismissal/reason.ts";

/**
 * The card's state as `data-*` attributes, each `""` when it applies and
 * absent otherwise: one of `data-open` and `data-closed`. Every part merges
 * the same object, so its getters are read where each element uses them.
 */
export type PreviewCardStateAttributes = {
  readonly "data-open": "" | undefined;
  readonly "data-closed": "" | undefined;
};

/** What the Root shares with its parts. */
export interface PreviewCardRootContextValue {
  /** Whether the card is open. */
  open(): boolean;
  /** Asks to open or close the card, saying why. */
  setOpen(open: boolean, details: OpenChangeDetails): void;
  /** Opens the card after the delay, for keyboard focus on the Trigger. */
  openOnFocus(event: FocusEvent): void;
  /** Cancels an opening `openOnFocus` started. */
  cancelFocus(): void;
  /**
   * Closes the card for focus that moved from the Trigger or the Popup to
   * `to`, unless `to` is either of them or the pointer is on one (README,
   * "Decisions").
   */
  closeOnFocusLeaving(to: EventTarget | null, details: OpenChangeDetails): void;
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
  readonly attributes: PreviewCardStateAttributes;
}

// `null` outside a Root, so that the part can name what is missing. Solid's
// own error for a context with no provider and no default does not.
export const PreviewCardRootContext =
  createContext<PreviewCardRootContextValue | null>(null);

export function usePreviewCardRootContext(): PreviewCardRootContextValue {
  const context = useContext(PreviewCardRootContext);
  // Production builds drop the check, and its message, with `isDev`.
  if (isDev && !context) {
    throw new Error(
      "[menhir] PreviewCard parts must be placed within <PreviewCard.Root>.",
    );
  }
  return context!;
}
