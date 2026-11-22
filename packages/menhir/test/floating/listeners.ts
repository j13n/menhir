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
  // A browser defines the window's methods on the window itself, as it does
  // for every global object, so they are spied on there too.
  const owners: EventTarget[] = [EventTarget.prototype];
  if (Object.hasOwn(window, "addEventListener")) owners.push(window);
  for (const owner of owners) {
    const add = owner.addEventListener;
    const remove = owner.removeEventListener;
    vi.spyOn(owner, "addEventListener").mockImplementation(function (
      this: EventTarget,
      type,
      listener,
      options,
    ) {
      if (listener) {
        const { entry, capture } = find(this, type, listener, options);
        if (!entry) present.add({ target: this, type, listener, capture });
      }
      add.call(this, type, listener, options);
    });
    vi.spyOn(owner, "removeEventListener").mockImplementation(function (
      this: EventTarget,
      type,
      listener,
      options,
    ) {
      if (listener) {
        const { entry } = find(this, type, listener, options);
        if (entry) present.delete(entry);
      }
      remove.call(this, type, listener, options);
    });
  }
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
