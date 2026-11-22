import { createContext, useContext } from "solid-js";
import type { Accessor } from "solid-js";
import { isDev } from "@solidjs/web";

import type {
  Position,
  PositionMiddleware,
} from "../../floating/positioning/createPosition.ts";

/** What the Popup shares with the Arrow. */
export interface PopoverPopupContextValue {
  /** The placement last written, with its resolved side and alignment. */
  position: Accessor<Position | undefined>;
  /**
   * Registers the middleware of a mounted Arrow, as a getter, for the Popup
   * to place it. Returns what unregisters it, for the Arrow's disposal.
   */
  registerArrow(middleware: () => PositionMiddleware): () => void;
}

export const PopoverPopupContext =
  createContext<PopoverPopupContextValue | null>(null);

export function usePopoverPopupContext(): PopoverPopupContextValue {
  const context = useContext(PopoverPopupContext);
  // Production builds drop the check, and its message, with `isDev`.
  if (isDev && !context) {
    throw new Error(
      "[menhir] Popover.Arrow must be placed within <Popover.Popup>.",
    );
  }
  return context!;
}
