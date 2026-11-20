import { isDev } from "@solidjs/web";
import { createEffect, createSignal, untrack } from "solid-js";
import type { Accessor } from "solid-js";

/**
 * A part's value that the consumer may control. Pass the props as getters,
 * so they are read where they are used:
 *
 * ```ts
 * const [checked, setChecked] = createControllableSignal({
 *   get value() { return props.checked; },
 *   get defaultValue() { return props.defaultChecked ?? false; },
 *   onChange: (value) => props.onCheckedChange?.(value),
 * });
 * ```
 *
 * Controlled while `value` is not `undefined`: the value follows it, and a
 * set only calls `onChange`, for the consumer to decide. Otherwise the value
 * starts at `defaultValue`, read once, and a set changes it, then calls
 * `onChange`. Setting the value it already has, counting earlier sets in
 * the same turn, does nothing. Set from event handlers, not from a
 * component body or a memo.
 */
export function createControllableSignal<T>(options: {
  readonly value?: T;
  readonly defaultValue: T;
  onChange?: (value: T) => void;
}): [value: Accessor<T>, setValue: (next: T) => void] {
  // A writable derived signal that reads the default once, untracked, so a
  // later change to it does not reset the value. Seeding through a function
  // also keeps a function-valued default from being taken as a derivation.
  const [internal, setInternal] = createSignal<T>(() =>
    untrack(() => options.defaultValue),
  );
  // Controlled while the consumer passes a value. `undefined` means
  // uncontrolled, as with an absent prop.
  const isControlled = () => options.value !== undefined;
  const value = () => (isControlled() ? (options.value as T) : internal());
  // A switch is usually a bug, such as state that starts `undefined`, so
  // development builds warn. Production builds drop this branch: Solid's
  // production `isDev` is a constant `false`.
  if (isDev) {
    createEffect(isControlled, (controlled, previous) => {
      if (previous !== undefined && controlled !== previous) {
        console.warn(
          `[menhir] A part switched from ${previous ? "controlled" : "uncontrolled"} to ${controlled ? "controlled" : "uncontrolled"}. ` +
            "Keep it one or the other for its lifetime; for an empty controlled value, pass null, not undefined.",
        );
      }
    });
  }
  // Reads lag writes until the next flush, so a set is compared with the
  // last value set in this turn, if any, not with what `value` still reads.
  // The microtask is queued after the writes, so it runs after Solid's flush
  // and `value` is current again by then.
  let pending: [T] | undefined;
  const setValue = (next: T) => {
    if (Object.is(next, pending ? pending[0] : untrack(value))) return;
    if (!untrack(isControlled)) setInternal(() => next);
    options.onChange?.(next);
    if (!pending) queueMicrotask(() => (pending = undefined));
    pending = [next];
  };
  return [value, setValue];
}
