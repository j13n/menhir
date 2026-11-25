import { createContext, useContext } from "solid-js";
import { isDev } from "@solidjs/web";

export type ScrollAreaScrollbarContextValue = {
  /** `data-vertical` or `data-horizontal`, for the Thumb. */
  attributes: {
    readonly "data-vertical": "" | undefined;
    readonly "data-horizontal": "" | undefined;
  };
  /** The Thumb's element, once it is created. */
  thumb?: HTMLElement;
};

export const ScrollAreaScrollbarContext =
  createContext<ScrollAreaScrollbarContextValue | null>(null);

export function useScrollAreaScrollbarContext(): ScrollAreaScrollbarContextValue {
  const context = useContext(ScrollAreaScrollbarContext);
  // Production builds drop the check, and its message, with `isDev`.
  if (isDev && !context) {
    throw new Error(
      "[menhir] ScrollArea.Thumb must be placed within <ScrollArea.Scrollbar>.",
    );
  }
  return context!;
}
