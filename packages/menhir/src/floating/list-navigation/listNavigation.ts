import { createEffect, createMemo, createSignal } from "solid-js";
import type { Signal } from "solid-js";

/** An item of a list, as list navigation knows it. */
export interface ListItem {
  readonly element: HTMLElement;
  /**
   * The item's text, for typeahead (#98) and a Select's value, when its
   * content is not its label. Without it, the element's text content.
   */
  readonly text?: string;
}

/** The options of `createListNavigation`, as getters and functions. */
export interface ListNavigationOptions<T extends ListItem> {
  /**
   * Whether the list's popup is open. While it is closed, focus does not
   * move and, once it has closed, no item is active. Left out for a list
   * that is always shown.
   */
  readonly open?: boolean;
  /** Up and Down move in a vertical list (the default), Left and Right in a horizontal one. */
  readonly orientation?: "horizontal" | "vertical";
  /** Whether the keys wrap from the last item to the first and back (default `false`). */
  readonly wrap?: boolean;
  /** Whether the keys and the pointer reach this item (by default, every item). */
  reachable?(item: T): boolean;
  /**
   * The key that points into the active item: Right in a vertical list
   * (Left right to left), Down in a horizontal one. Opens a submenu.
   */
  onArrowIn?(item: T, event: KeyboardEvent): void;
  /**
   * The key that points out of the list: Left in a vertical list (Right
   * right to left), Up in a horizontal one. Closes a submenu.
   */
  onArrowOut?(item: T | undefined, event: KeyboardEvent): void;
}

/** What `createListNavigation` returns, in both ways of holding focus. */
export interface ListNavigation<T extends ListItem> {
  /** Adds a mounted item; returns what removes it. */
  register(item: T): () => void;
  /** The items the keys reach, in document order. */
  items(): T[];
  /** The active item, if any. */
  active(): T | undefined;
  /**
   * Whether `item` is the active one. A move re-runs it for the item that
   * was active and the one that is, not for every item.
   */
  isActive(item: T): boolean;
  /**
   * Makes `item` active as the keyboard does: it is focused, in the roving
   * form, and scrolled into view. An item the keys do not reach is ignored;
   * `undefined` leaves no item active.
   */
  move(item: T | undefined): void;
  /**
   * Arrow keys, Home and End, from one of the items or from the element
   * that hands them over; returns whether it used the key.
   */
  onKeyDown(event: KeyboardEvent): boolean;
  /** The pointer moving on an item makes it active, without scrolling. */
  onPointerMove(item: T, event: PointerEvent): void;
}

// Document order, which can differ from the order items registered in.
const byPosition = (a: ListItem, b: ListItem) =>
  a.element.compareDocumentPosition(b.element) &
  Node.DOCUMENT_POSITION_FOLLOWING
    ? -1
    : 1;

/**
 * The items of a list in document order, the active item, the keys and the
 * pointer: what both ways of holding focus share. `focusItem` is the way's
 * own: the roving form focuses the item. Nothing runs at import time, nor,
 * until a key or the pointer, on the server.
 */
export function createListNavigation<T extends ListItem>(
  options: ListNavigationOptions<T>,
  focusItem?: (item: T) => void,
): ListNavigation<T> {
  const [registered, setRegistered] = createSignal<T[]>([]);
  // Sorted again only when an item registers or leaves.
  const ordered = createMemo(() => [...registered()].sort(byPosition));
  const reachable = (item: T) => options.reachable?.(item) ?? true;
  const [active, setActive] = createSignal<T>();
  // Each item's own active signal, so a move sets two of them, and only the
  // two items that read them run again. Made on the item's first read.
  const activeSignals = new WeakMap<T, Signal<boolean>>();
  const activeSignal = (item: T) => {
    let signal = activeSignals.get(item);
    if (!signal) {
      const [read, write] = createSignal(false);
      activeSignals.set(item, (signal = [read, write]));
    }
    return signal;
  };
  // The active item as written, where `active()` lags until the flush.
  let activeItem: T | undefined;
  const activate = (item: T | undefined) => {
    if (activeItem) activeSignal(activeItem)[1](false);
    if (item) activeSignal(item)[1](true);
    activeItem = item;
    setActive(() => item);
  };

  // As the keyboard shows an item: focused, in the roving form, and
  // scrolled into view at the near edge, so one already in view does not
  // move.
  const focusAndScroll = (item: T) => {
    focusItem?.(item);
    item.element.scrollIntoView({ block: "nearest", inline: "nearest" });
  };

  const list: ListNavigation<T> = {
    register: (item) => {
      setRegistered((items) => [...items, item]);
      return () => {
        setRegistered((items) => items.filter((other) => other !== item));
        if (activeItem === item) activate(undefined);
      };
    },
    items: () => ordered().filter(reachable),
    active,
    isActive: (item) => activeSignal(item)[0](),
    move: (item) => {
      if (item && !reachable(item)) return;
      activate(item);
      // While the popup is closed, the item takes no focus and does not
      // scroll, though an exit animation may still show it: it is focused
      // and scrolled into view once the popup opens (below).
      if (item && options.open !== false) focusAndScroll(item);
    },
    onKeyDown: (event) => {
      // Only a key from one of its items, or from the element that hands
      // it over, such as a combobox's input: a nested list, such as a
      // submenu in an item, takes its own keys, which bubble through it.
      const { target } = event;
      if (
        target !== event.currentTarget &&
        !registered().some((item) => item.element === target)
      )
        return false;
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey)
        return false;
      const items = list.items();
      const itemCount = items.length;
      const activeIndex = items.indexOf(activeItem!);
      // Right to left, Left points forward. `direction` inherits, so an
      // item's own is its list's.
      const directionSource = (activeItem ?? items[0])?.element;
      const [leftKey, rightKey] =
        directionSource && getComputedStyle(directionSource).direction === "rtl"
          ? ["ArrowRight", "ArrowLeft"]
          : ["ArrowLeft", "ArrowRight"];
      const [backKey, forwardKey, outKey, intoKey] =
        options.orientation === "horizontal"
          ? [leftKey, rightKey, "ArrowUp", "ArrowDown"]
          : ["ArrowUp", "ArrowDown", leftKey, rightKey];
      // Into the active item, or out of the list: the component's to act
      // on, such as a submenu.
      const { onArrowIn, onArrowOut } = options;
      if (event.key === intoKey && activeItem && onArrowIn) {
        onArrowIn(activeItem, event);
        return true;
      }
      if (event.key === outKey && onArrowOut) {
        onArrowOut(activeItem, event);
        return true;
      }
      const toIndex =
        event.key === backKey
          ? (activeIndex < 0 ? itemCount : activeIndex) - 1
          : event.key === forwardKey
            ? activeIndex + 1
            : event.key === "Home"
              ? 0
              : event.key === "End"
                ? itemCount - 1
                : undefined;
      if (toIndex === undefined || !itemCount) return false;
      event.preventDefault();
      list.move(
        items[
          options.wrap
            ? (toIndex + itemCount) % itemCount
            : Math.min(Math.max(toIndex, 0), itemCount - 1)
        ],
      );
      return true;
    },
    onPointerMove: (item, event) => {
      // A finger that scrolls the list would make each item it crosses
      // active; a tap activates an item through the component's click.
      // A closed popup still shown, as during an exit animation, is left
      // alone, as `move` leaves it.
      if (options.open === false || event.pointerType === "touch") return;
      if (activeItem === item) return;
      if (!reachable(item)) return;
      activate(item);
      focusItem?.(item);
    },
  };

  createEffect(
    () => options.open,
    (open) => {
      // Set again on each opening, by the component.
      if (open === false) {
        activate(undefined);
        return;
      }
      // Once the popup is shown: after its own `showPopover()` in this
      // flush, whichever effect runs first, as `focus/initialFocus.ts`.
      queueMicrotask(() => {
        if (activeItem) focusAndScroll(activeItem);
      });
    },
  );
  return list;
}
