import { createSignal } from "solid-js";

/**
 * A value that one part registers once mounted, for another part to read,
 * such as the Arrow's middleware, which a popup's Popup uses to place it.
 * Returns the value, `undefined` while none is registered, and `register`,
 * which takes the value as a getter and returns what unregisters it, for
 * the part's disposal. Unregistering removes only the part's own value, so
 * one that another part registered after it stays.
 */
export function createSlot<T>(): [
  value: () => T | undefined,
  register: (value: () => T) => () => void,
] {
  const [slot, setSlot] = createSignal<(() => T) | undefined>();
  const value = () => slot()?.();
  const register = (next: () => T) => {
    setSlot(() => next);
    return () => setSlot((current) => (current === next ? undefined : current));
  };
  return [value, register];
}

/**
 * A slot for the `id` of a part that another part names, such as a popup's
 * Title, which the Popup names in `aria-labelledby`. `false`, a consumer's
 * way to remove the part's `id`, names nothing.
 */
export function createIdSlot(): [
  id: () => string | undefined,
  register: (id: () => string | false) => () => void,
] {
  const [slot, register] = createSlot<string | false>();
  const id = () => slot() || undefined;
  return [id, register];
}
