import { createSignal, onSettled } from "solid-js";
import type { Accessor } from "solid-js";

import { applyPreference, parsePreference } from "./preference.ts";
import type { PreferenceAttribute, PreferenceStorage } from "./preference.ts";

export interface PreferenceOptions<T extends string> {
  storageKey: string;
  attribute: PreferenceAttribute;
  /**
   * Every value that can be saved, and that the attribute can hold. A saved
   * value outside it reads as `unset`.
   */
  values: readonly string[];
  /**
   * The value while nothing is saved, such as color mode's `system` or a
   * default theme. Choosing it removes the saved value.
   */
  unset: T;
  /**
   * The value that goes on `<html>` for a value, such as `system`'s look.
   * Default: the value itself.
   */
  resolve?: (value: T) => string;
}

export interface Preference<T extends string> {
  value: Accessor<T>;
  /** Saves a value and applies it, here and in the other instances. */
  set: (value: T) => void;
  /** Applies the value again, for a `resolve` whose result has changed. */
  apply: () => void;
}

/** Tells the other instances in the same tab about a choice. */
const changeEvent = "menhir:preference";

interface ChangeDetail {
  storageKey: string;
  value: string;
}

/**
 * A preference of the reader's, saved in `storage` and applied to `<html>`,
 * that stays in step with the other instances in this tab and with other
 * tabs: what color mode and theme share.
 *
 * A storage only the browser can read, such as `localStorage`, is read once
 * the page has settled, so the server's HTML and the first client render
 * agree; until then the value is `unset`. One the server can read too, such
 * as a cookie, is read during the first render. The head script applies the
 * value before the first paint, so the page does not flash in between.
 *
 * The DOM is written imperatively, from `set` and the listeners, not from
 * an effect: an effect's first run would apply `unset` before the saved
 * value is read, undoing the head script.
 */
export function createPreference<T extends string>(
  storage: PreferenceStorage,
  options: PreferenceOptions<T>,
): Preference<T> {
  const { storageKey, attribute, values, unset } = options;
  const resolve = options.resolve ?? ((value: T) => value);
  const parse = (raw: string | null | undefined) =>
    parsePreference(raw, values, unset);

  const initial = storage.readsOnServer
    ? parse(storage.read(storageKey))
    : unset;
  // TypeScript cannot rule out that a `T` is a function, which
  // `createSignal` would take as a computation.
  const [value, setValue] = createSignal<T>(initial as Exclude<T, Function>);

  // Reads lag writes until the next flush, so the DOM is updated from this
  // copy rather than from the signal.
  let current = initial;
  const apply = () => applyPreference(attribute, resolve(current), values);
  const update = (next: T) => {
    setValue(() => (current = next));
    apply();
  };

  onSettled(() => {
    update(parse(storage.read(storageKey)));

    const onChange = (event: Event) => {
      const detail = (event as CustomEvent<ChangeDetail>).detail;
      if (detail.storageKey === storageKey) update(parse(detail.value));
    };
    const unwatch = storage.watch(storageKey, (raw) => update(parse(raw)));
    window.addEventListener(changeEvent, onChange);
    return () => {
      unwatch();
      window.removeEventListener(changeEvent, onChange);
    };
  });

  const set = (next: T) => {
    storage.write(storageKey, next === unset ? null : next);
    update(next);
    window.dispatchEvent(
      new CustomEvent<ChangeDetail>(changeEvent, {
        detail: { storageKey, value: next },
      }),
    );
  };

  return { value, set, apply };
}
