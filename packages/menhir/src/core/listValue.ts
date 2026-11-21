import { onFlush } from "solid-js";

import { createControllableSignal } from "./createControllableSignal.ts";

/** A value that lists items, in one of its two modes. */
export interface ListValue {
  /** Whether the item with this value is in the list. */
  has(item: string): boolean;
  /** Asks to add the item to the list, or to take it out. */
  set(item: string, included: boolean): void;
}

/**
 * A part's value that lists items and that the consumer may control, as an
 * array in every mode, `[]` when empty (PLAN.md section 8, "Controlled
 * state"): Toggle Group's pressed items, Accordion's open ones. Pass the
 * props as getters, so they are read where they are used:
 *
 * ```ts
 * const list = createListValue({
 *   get value() { return props.value; },
 *   get defaultValue() { return props.defaultValue; },
 *   get multiple() { return props.multiple; },
 *   onChange: (value) => props.onValueChange?.(value),
 * });
 * ```
 *
 * By default the list holds one item at most: adding an item replaces the
 * one before. With `multiple`, items are added and taken out on their own.
 * Sets in one turn build on each other, before the flush.
 */
export function createListValue(options: {
  readonly value?: string[];
  readonly defaultValue?: string[];
  readonly multiple?: boolean;
  onChange?: (value: string[]) => void;
}): ListValue {
  const [value, setValue] = createControllableSignal<string[]>({
    get value() {
      return options.value;
    },
    get defaultValue() {
      return options.defaultValue ?? [];
    },
    onChange: (value) => options.onChange?.(value),
  });
  // The value asked for in this turn, if any: reads lag writes, so a second
  // set before the flush builds on this, not on what `value` still reads.
  let pending: string[] | undefined;
  return {
    has: (item) => value().includes(item),
    set: (item, included) => {
      const current = pending ?? value();
      let next: string[] = included ? [item] : [];
      if (options.multiple) {
        next = current.filter((other) => other !== item);
        if (included) next.push(item);
      }
      if (!pending) onFlush(() => (pending = undefined));
      pending = next;
      setValue(next);
    },
  };
}
