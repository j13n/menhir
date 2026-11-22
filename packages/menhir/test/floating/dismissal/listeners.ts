import { vi } from "vitest";

interface Listener {
  target: EventTarget;
  type: string;
  listener: EventListenerOrEventListenerObject;
  capture: boolean;
}

/**
 * Records every event listener added and not yet removed, from now until
 * `vi.restoreAllMocks()`. `mark()` takes the listeners present as a
 * baseline, and `added()` names those added since and still present, as
 * `type` or `type (capture)`.
 */
export function trackListeners() {
  const present = new Set<Listener>();
  const add = EventTarget.prototype.addEventListener;
  const remove = EventTarget.prototype.removeEventListener;
  const find = (
    target: EventTarget,
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions,
  ) => {
    const capture =
      typeof options === "boolean" ? options : Boolean(options?.capture);
    for (const entry of present) {
      if (
        entry.target === target &&
        entry.type === type &&
        entry.listener === listener &&
        entry.capture === capture
      )
        return { entry, capture };
    }
    return { entry: undefined, capture };
  };
  vi.spyOn(EventTarget.prototype, "addEventListener").mockImplementation(
    function (this: EventTarget, type, listener, options) {
      if (listener) {
        const { entry, capture } = find(this, type, listener, options);
        if (!entry) present.add({ target: this, type, listener, capture });
      }
      add.call(this, type, listener, options);
    },
  );
  vi.spyOn(EventTarget.prototype, "removeEventListener").mockImplementation(
    function (this: EventTarget, type, listener, options) {
      if (listener) {
        const { entry } = find(this, type, listener, options);
        if (entry) present.delete(entry);
      }
      remove.call(this, type, listener, options);
    },
  );
  let baseline = new Set<Listener>();
  return {
    mark() {
      baseline = new Set(present);
    },
    added() {
      return [...present]
        .filter((entry) => !baseline.has(entry))
        .map((entry) => `${entry.type}${entry.capture ? " (capture)" : ""}`)
        .sort();
    },
  };
}
