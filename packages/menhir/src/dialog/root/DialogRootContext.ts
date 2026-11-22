import { createContext, useContext } from "solid-js";
import { isDev } from "@solidjs/web";

import type { OpenChangeDetails } from "../../floating/dismissal/reason.ts";

/**
 * The dialog's state as `data-*` attributes, each `""` when it applies and
 * absent otherwise: one of `data-open` and `data-closed`. Every part merges
 * the same object, so its getters are read where each element uses them.
 */
export type DialogStateAttributes = {
  readonly "data-open": "" | undefined;
  readonly "data-closed": "" | undefined;
};

/** What the Root shares with its parts. */
export interface DialogRootContextValue {
  /** Whether the dialog is open. */
  open(): boolean;
  /** Asks to open or close the dialog, saying why. */
  setOpen(open: boolean, details: OpenChangeDetails): void;
  /** The `id` of the rendered Title, which the Popup names, if any. */
  titleId(): string | undefined;
  /**
   * Hands over the `id` of a mounted Title, as a getter. Returns what takes
   * it back, for the Title's disposal.
   */
  setTitleId(id: () => string | false): () => void;
  /** The `id` of the rendered Description, which the Popup names, if any. */
  descriptionId(): string | undefined;
  /** As `setTitleId`, for the Description. */
  setDescriptionId(id: () => string | false): () => void;
  /** The `data-*` attributes every part carries. */
  readonly attributes: DialogStateAttributes;
}

// `null` outside a Root, so that the part can name what is missing. Solid's
// own error for a context with no provider and no default does not.
export const DialogRootContext = createContext<DialogRootContextValue | null>(
  null,
);

export function useDialogRootContext(): DialogRootContextValue {
  const context = useContext(DialogRootContext);
  // Production builds drop the check, and its message, with `isDev`.
  if (isDev && !context) {
    // Alert Dialog's parts are Dialog's (#32), and cannot tell which.
    throw new Error(
      "[menhir] Dialog parts must be placed within <Dialog.Root>, and Alert Dialog parts within <AlertDialog.Root>.",
    );
  }
  return context!;
}
