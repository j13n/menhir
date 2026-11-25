import { createContext, useContext } from "solid-js";
import type { Accessor } from "solid-js";
import { isDev } from "@solidjs/web";

import type {
  Position,
  PositionMiddleware,
} from "../../floating/positioning/createPosition.ts";

/** What the Popup shares with the Arrow. */
export interface PreviewCardPopupContextValue {
  /** The placement last written, with its resolved side and alignment. */
  position: Accessor<Position | undefined>;
  /**
   * Registers the middleware of a mounted Arrow, as a getter, for the Popup
   * to place it. Returns what unregisters it, for the Arrow's disposal.
   */
  registerArrow(middleware: () => PositionMiddleware): () => void;
}

export const PreviewCardPopupContext =
  createContext<PreviewCardPopupContextValue | null>(null);

export function usePreviewCardPopupContext(): PreviewCardPopupContextValue {
  const context = useContext(PreviewCardPopupContext);
  // Production builds drop the check, and its message, with `isDev`.
  if (isDev && !context) {
    throw new Error(
      "[menhir] PreviewCard.Arrow must be placed within <PreviewCard.Popup>.",
    );
  }
  return context!;
}
