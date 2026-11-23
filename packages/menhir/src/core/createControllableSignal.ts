import { isDev } from "@solidjs/web";
import { createSignal, onFlush, untrack } from "solid-js";
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
 * starts at `defaultValue`, read once, and a set calls `onChange` and
 * changes the value right after the pending flush, in an update of its own
 * (`onFlush`), so async work that `onChange` starts does not hold it back.
 * Setting the value it already has, counting earlier sets in the same turn,
 * does nothing. Set from event handlers, not from a component body or a
 * memo. A set may pass `details`, such as why a popup closed, which
 * `onChange` receives after the value.
 *
 * The third item, `requested`, reads untracked the value set last in this
 * turn, or `value` if nothing was: for a handler that builds on a set made
 * earlier in the same turn, which `value` shows only after the flush.
 */
export function createControllableSignal<T, Details = void>(options: {
  readonly value?: T;
  readonly defaultValue: T;
  onChange?: (value: T, details: Details) => void;
}): [
  value: Accessor<T>,
  setValue: (next: T, details: Details) => void,
  requested: () => T,
] {
  // A writable derived signal that reads the default once, untracked, so a
  // later change to it does not reset the value. Seeding through a function
  // also keeps a function-valued default from being taken as a derivation.
  const [internal, setInternal] = createSignal<T>(() =>
    untrack(() => options.defaultValue),
  );
  // Controlled while the consumer passes a value. `undefined` means
  // uncontrolled, as with an absent prop.
  //
  // A switch is usually a bug, such as state that starts `undefined`, so
  // development builds warn, on the first read in the new mode. The check
  // is not an effect: an effect takes a place in the owner tree, which
  // hydration keys come from, so a server and a client that disagree on
  // `isDev` would no longer match. Production builds drop this branch:
  // Solid's production `isDev` is a constant `false`.
  let wasControlled: boolean | undefined;
  const isControlled = () => {
    const controlled = options.value !== undefined;
    if (isDev) {
      if (wasControlled !== undefined && controlled !== wasControlled) {
        console.warn(
          `[menhir] A part switched from ${wasControlled ? "controlled" : "uncontrolled"} to ${controlled ? "controlled" : "uncontrolled"}. ` +
            "Keep it one or the other for its lifetime; for an empty controlled value, pass null, not undefined.",
        );
      }
      wasControlled = controlled;
    }
    return controlled;
  };
  const value = () => (isControlled() ? (options.value as T) : internal());
  // Reads lag writes, so a set is compared with the last value set in this
  // turn, if any, not with what `value` still reads.
  let pending: [T] | undefined;
  const requested = () => (pending ? pending[0] : untrack(value));
  const setValue = (next: T, details: Details) => {
    if (Object.is(next, requested())) return;
    // The part's own write is an update of its own, after the pending
    // flush: written inline, it would be held with any async work that
    // `onChange` starts, such as a fetch, and the part would not change
    // until that work settled.
    if (!untrack(isControlled)) onFlush(() => setInternal(() => next));
    options.onChange?.(next, details);
    const set: [T] = [next];
    pending = set;
    // `onFlush` callbacks run in call order, each flushed before the next,
    // so `value` is current by the time this one runs.
    onFlush(() => {
      if (pending === set) pending = undefined;
    });
  };
  return [value, setValue, requested];
}
