import { createContext, useContext } from "solid-js";
import { isDev } from "@solidjs/web";

import type { ElementProps } from "../../core/renderElement.tsx";
import type { NumberFieldRootProps } from "./NumberFieldRoot.tsx";

/** What the Root shares with its parts. */
export interface NumberFieldRootContextValue {
  readonly props: NumberFieldRootProps;
  /** The value, `null` while the field is empty. */
  value(): number | null;
  /** The value as the Input shows it, `""` while `null`. */
  text(): string;
  /** The Input's `id`: the Root's, else a generated one. */
  inputId(): string;
  /** `data-disabled`, `data-readonly` and `data-required`, for every part. */
  readonly attributes: ElementProps;
  /** The Input, once rendered. */
  input?: HTMLInputElement;
  /** Whether the user has edited the text since it last showed the value. */
  edited: boolean;
  /**
   * Puts the Input's text and the hidden input back to the value, and marks
   * the text unedited.
   */
  sync(): void;
  /** Whether the user can change the value: neither disabled nor read-only. */
  enabled(): boolean;
  /** Whether a step that way could change the value. */
  canStep(direction: 1 | -1): boolean;
  /** Steps the value by `step` that way, or by `largeStep` when `large`. */
  step(direction: 1 | -1, large?: boolean): void;
  /** Sets the value to `min` or `max`, for Home and End. */
  setLimit(limit: "min" | "max"): void;
  /** Parses the text the user typed, if edited, into the value. */
  commit(): void;
}

// `null` outside a Root, so that the part can name what is missing. Solid's
// own error for a context with no provider and no default does not.
export const NumberFieldRootContext =
  createContext<NumberFieldRootContextValue | null>(null);

export function useNumberFieldRootContext(): NumberFieldRootContextValue {
  const context = useContext(NumberFieldRootContext);
  // Production builds drop the check, and its message, with `isDev`.
  if (isDev && !context) {
    throw new Error(
      "[menhir] NumberField parts must be placed within <NumberField.Root>.",
    );
  }
  return context!;
}
