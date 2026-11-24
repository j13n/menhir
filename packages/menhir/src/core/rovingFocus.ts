import { createMemo, createSignal } from "solid-js";

/** An item of a composite widget, as its roving focus knows it. */
export interface RovingItem {
  readonly element: HTMLElement;
}

/** What `createRovingFocus` returns. */
export interface RovingFocus<T extends RovingItem> {
  /** Adds a mounted item to the focus order; returns what removes it. */
  register(item: T): () => void;
  /**
   * Whether this item has the tab stop. Before any item has registered, as
   * on the server and in the first render, it is `fallback`, which the
   * component decides.
   */
  isTabStop(element: HTMLElement | undefined, fallback: boolean): boolean;
  /** Moves focus for an arrow, Home or End key pressed on an item. */
  navigate(event: KeyboardEvent, from: HTMLElement): void;
}

// Document order, which can differ from the order items registered in.
const byPosition = (a: RovingItem, b: RovingItem) =>
  a.element.compareDocumentPosition(b.element) &
  Node.DOCUMENT_POSITION_FOLLOWING
    ? -1
    : 1;

/**
 * One tab stop among a group's items, with arrow keys between them (roving
 * tabindex, PLAN.md section 8, "A group of items is one tab stop"): Toggle
 * Group's items, Tabs' tabs, a Radio's radios. Pass the options as getters and functions, so
 * they are read where they are used:
 *
 * ```ts
 * const roving = createRovingFocus({
 *   get vertical() { return props.orientation === "vertical"; },
 *   focusable: (item) => !item.disabled(),
 *   preferred: (item) => item.element === active(),
 * });
 * ```
 *
 * Items register once mounted, so the order follows the document. The tab
 * stop is the first `preferred` focusable item, else the first focusable
 * one. Arrow keys move focus among the focusable items and wrap: Left and
 * Right, mirrored right to left, or Up and Down when `vertical`, and Home
 * and End. With a modifier held, the keys are left to the browser.
 */
export function createRovingFocus<T extends RovingItem>(options: {
  readonly vertical: boolean;
  focusable(item: T): boolean;
  preferred(item: T): boolean;
}): RovingFocus<T> {
  const [items, setItems] = createSignal<T[]>([]);
  const focusable = () => items().filter(options.focusable).sort(byPosition);
  const tabStop = createMemo(() => {
    const list = focusable();
    return (list.find(options.preferred) ?? list[0])?.element;
  });
  return {
    register: (item) => {
      setItems((list) => [...list, item]);
      return () => setItems((list) => list.filter((other) => other !== item));
    },
    isTabStop: (element, fallback) =>
      items().length ? !!element && tabStop() === element : fallback,
    navigate: (event, from) => {
      // With a modifier, the keys are the browser's or the app's, such as
      // Alt+Left for back.
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey)
        return;
      const list = focusable();
      const count = list.length;
      const index = list.findIndex((item) => item.element === from);
      // Right to left, the next item is on the left. `direction` inherits,
      // so the item's own is the group's.
      const [previous, next] = options.vertical
        ? ["ArrowUp", "ArrowDown"]
        : getComputedStyle(from).direction === "rtl"
          ? ["ArrowRight", "ArrowLeft"]
          : ["ArrowLeft", "ArrowRight"];
      const target =
        event.key === previous
          ? index - 1
          : event.key === next
            ? index + 1
            : event.key === "Home"
              ? 0
              : event.key === "End"
                ? count - 1
                : undefined;
      if (target === undefined || !count) return;
      // Arrow keys and Home and End would scroll the page.
      event.preventDefault();
      list[(target + count) % count].element.focus();
    },
  };
}
