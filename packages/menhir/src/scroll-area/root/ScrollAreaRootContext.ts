import { createContext, useContext } from "solid-js";
import { isDev } from "@solidjs/web";

/** An axis of the area: `x` across, `y` down. */
export type ScrollAreaAxis = "x" | "y";

/**
 * The area's state as `data-*` attributes, each `""` when it applies and
 * absent otherwise, on every part.
 */
export type ScrollAreaAttributes = {
  readonly "data-scrolling": "" | undefined;
  readonly "data-overflow-x": "" | undefined;
  readonly "data-overflow-y": "" | undefined;
  readonly "data-overflow-x-start": "" | undefined;
  readonly "data-overflow-x-end": "" | undefined;
  readonly "data-overflow-y-start": "" | undefined;
  readonly "data-overflow-y-end": "" | undefined;
};

export type ScrollAreaRootContextValue = {
  attributes: ScrollAreaAttributes;
  /** The Viewport's element, once it is created. */
  viewport?: HTMLElement;
  /** Watches an element's size, the Viewport's or the Content's; returns what stops it. */
  observe: (element: HTMLElement) => () => void;
  /** The Viewport's `scroll` event. */
  scrolled: () => void;
  /** Whether the content is longer than the viewport along the axis. */
  overflows: (axis: ScrollAreaAxis) => boolean;
  /** The viewport's share of the content along the axis, such as `25%`. */
  thumbSize: (axis: ScrollAreaAxis) => string;
  /** How far the area is scrolled from the axis's start, 0 to 1. */
  thumbPosition: (axis: ScrollAreaAxis) => number;
  /** Whether the system's scrollbars are hidden, for the component's to show. */
  hidesSystem: () => boolean;
  /** A Scrollbar counts itself once mounted; returns what uncounts it. */
  registerScrollbar: () => () => void;
};

// `null` outside a Root, so that the part can name what is missing. Solid's
// own error for a context with no provider and no default does not.
export const ScrollAreaRootContext =
  createContext<ScrollAreaRootContextValue | null>(null);

export function useScrollAreaRootContext(): ScrollAreaRootContextValue {
  const context = useContext(ScrollAreaRootContext);
  // Production builds drop the check, and its message, with `isDev`.
  if (isDev && !context) {
    throw new Error(
      "[menhir] ScrollArea parts must be placed within <ScrollArea.Root>.",
    );
  }
  return context!;
}
