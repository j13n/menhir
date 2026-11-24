import { createContext, useContext } from "solid-js";
import { isDev } from "@solidjs/web";

import type { RovingItem } from "../../core/rovingFocus.ts";

/** A mounted Item, as the group knows it. */
export interface RadioItemEntry extends RovingItem {
  /** The Item's hidden input, which the group checks again after a declined change. */
  readonly input: HTMLInputElement;
  disabled(): boolean;
  checked(): boolean;
}

/** What the group shares with its Items. */
export interface RadioRootContextValue {
  /** The checked Item's value, `null` while none is checked. */
  value(): string | null;
  /** Asks to check the Item with this value. */
  select(value: string): void;
  /** Asks for `defaultValue`, on a form reset. Asked once however many Items ask. */
  reset(): void;
  /** The `name` each Item's hidden input takes. */
  name(): string | undefined;
  /** The `id` of the form the Items belong to, when they are not inside it. */
  form(): string | undefined;
  /** Whether the whole group is disabled. */
  disabled(): boolean | undefined;
  /** Whether each Item's hidden input is `required`: while none is checked in a required group. */
  required(): boolean | undefined;
  /** Adds a mounted Item; returns what removes it. */
  register(item: RadioItemEntry): () => void;
  /** Whether this Item has the tab stop; `fallback` until Items register. */
  isTabStop(element: HTMLElement | undefined, fallback: boolean): boolean;
  /**
   * Whether an Item, created checked or not and enabled or not, has the tab
   * stop of the server HTML and of the first render.
   */
  claimTabStop(checked: boolean, disabled: boolean): boolean;
  /** Moves focus, and checks, for an arrow key pressed on an Item. */
  navigate(event: KeyboardEvent, from: HTMLElement): void;
  /** Whether focus is moving by an arrow key, so the Item it reaches checks. */
  moving(): boolean;
}

// `null` outside a Root, so that the part can name what is missing. Solid's
// own error for a context with no provider and no default does not.
export const RadioRootContext = createContext<RadioRootContextValue | null>(
  null,
);

export function useRadioRootContext(): RadioRootContextValue {
  const context = useContext(RadioRootContext);
  // Production builds drop the check, and its message, with `isDev`.
  if (isDev && !context) {
    throw new Error("[menhir] Radio.Item must be placed within <Radio.Root>.");
  }
  return context!;
}
