/**
 * Where focus goes when a popup opens or closes, overriding the browser:
 * an element, or a function called then with the element the browser
 * focused, or `null` when it focused none. `(focused) => focused ?? other`
 * keeps the browser's choice and replaces only a missing one. `undefined`,
 * or a function that returns it, leaves focus where the browser put it.
 */
export type FocusTarget =
  | HTMLElement
  | null
  | undefined
  | ((focused: Element | null) => HTMLElement | null | undefined);
