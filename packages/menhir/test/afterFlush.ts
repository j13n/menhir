import { onFlush } from "solid-js";

/**
 * Resolves once the updates a part has deferred with `onFlush` have been
 * applied, such as an uncontrolled part's own state after an event
 * (`createControllableSignal`). `flush()`, and the one after every event
 * (`createRenderer`), does not run them: they run in a microtask after it.
 * `onFlush` callbacks run in call order, each flushed before the next, so
 * this one runs after every callback queued before it.
 */
export function afterFlush(): Promise<void> {
  return new Promise((resolve) => onFlush(resolve));
}
