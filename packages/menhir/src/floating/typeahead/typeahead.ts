import { createEffect, onCleanup } from "solid-js";

import { findMatch, type TypeaheadItem } from "./match.ts";

/** What `createTypeahead` returns. */
export interface Typeahead {
  /**
   * A key from one of the items, or from the element that hands them over;
   * returns whether it used the key.
   */
  onKeyDown(event: KeyboardEvent): boolean;
}

// How long after the last key the typed string resets: what Chromium's
// native <select> waits (README.md, Decisions).
const resetDelay = 1000;

/**
 * Typing characters moves to the item whose text starts with them
 * (`findMatch`). Characters typed less than a second apart make one string;
 * Space joins a string being typed. The component hands over list
 * navigation's items, active item and move, and calls the handler from its
 * items' key events, before its own Space activation:
 *
 * ```ts
 * const typeahead = createTypeahead<Entry>({
 *   get open() { return open(); },
 *   get items() { return list.items(); },
 *   get active() { return list.active(); },
 *   move: (item) => list.move(item),
 * });
 * // In the item part:
 * onKeyDown: (event) => {
 *   if (typeahead.onKeyDown(event) || list.onKeyDown(event)) return;
 *   if (event.key === " " || event.key === "Enter") activate(event);
 * },
 * ```
 *
 * The handler cancels each key it uses. Closing the popup (`open` turning
 * false) and disposal clear the string and its timer; opening does not, so
 * a closed Select's trigger may open on the first key and the string goes
 * on. Nothing runs at import time, nor, until a key, on the server.
 */
export function createTypeahead<T extends TypeaheadItem>(options: {
  readonly open?: boolean;
  readonly items: readonly T[];
  readonly active: T | undefined;
  move(item: T): void;
}): Typeahead {
  let typed = "";
  let timer: ReturnType<typeof setTimeout> | undefined;
  const reset = () => {
    clearTimeout(timer);
    typed = "";
  };
  // Not on opening: a closed Select opens on the first key, and the string
  // goes on.
  createEffect(
    () => options.open,
    (open) => {
      if (open === false) reset();
    },
  );
  onCleanup(reset);
  return {
    onKeyDown: (event) => {
      const { key, target } = event;
      const items = options.items;
      // Only a key from one of its items, or from the element whose handler
      // calls this, such as a closed Select's trigger: a nested list, such
      // as a submenu in an item, takes its own keys, which bubble through
      // it. As list navigation's check, except that `items` holds only the
      // items the keys reach: a focused item they do not reach hands its
      // key over from its own handler, as the target, and is taken all the
      // same. A printable character is a key of one character, astral ones
      // too; with Control, Alt or Meta it is a shortcut. Space is part of a
      // string being typed, and else the part's. While an input method
      // composes, its text arrives as events of its own.
      if (
        (target !== event.currentTarget &&
          !items.some((item) => item.element === target)) ||
        event.isComposing ||
        event.ctrlKey ||
        event.altKey ||
        event.metaKey ||
        !/^.$/u.test(key) ||
        (key === " " && !typed)
      )
        return false;
      // So that a key typed into the string does nothing else.
      event.preventDefault();
      typed += key;
      clearTimeout(timer);
      timer = setTimeout(reset, resetDelay);
      const active = options.active;
      const match = findMatch(items, active, typed);
      if (match && match !== active) options.move(match);
      return true;
    },
  };
}
