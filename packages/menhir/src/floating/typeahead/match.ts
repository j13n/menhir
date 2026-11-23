/** An item typeahead can move to: list navigation's item (#97). */
export interface TypeaheadItem {
  readonly element: Element;
  /** The item's label, when its content is not; else its text content. */
  readonly text?: string;
}

// Made on the first key, never at import time (PLAN.md section 6, rule 2),
// and kept for the page: it holds no state.
let collator: Intl.Collator | undefined;

/**
 * The item that `typed` moves to, from `active`, or `undefined`:
 *
 * ```ts
 * const item = findMatch(list.items(), list.active(), "ba");
 * ```
 */
export function findMatch<T extends TypeaheadItem>(
  items: readonly T[],
  active: T | undefined,
  typed: string,
): T | undefined {
  const characters = [...typed];
  // One character, or the same one repeated: the search cycles through
  // the items that start with it.
  const cycles = characters.every((character) => character === characters[0]);
  const search = cycles ? characters[0]! : typed;
  const count = items.length;
  const index = items.indexOf(active!);
  // One character searches after the active item, a longer string from it
  // on, so the item the first character reached stays while it matches.
  const start = index < 0 ? 0 : index + (cycles ? 1 : 0);
  for (let offset = 0; offset < count; offset++) {
    const item = items[(start + offset) % count]!;
    // Read now, so a label that changed is matched as it is.
    const text = (item.text ?? item.element.textContent ?? "").trimStart();
    // Case and accents ignored.
    collator ??= new Intl.Collator(undefined, { sensitivity: "base" });
    if (!collator.compare(text.slice(0, search.length), search)) return item;
  }
  return undefined;
}
