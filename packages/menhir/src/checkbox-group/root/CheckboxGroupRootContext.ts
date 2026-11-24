import { createContext, useContext } from "solid-js";
import { isDev } from "@solidjs/web";

/** What the group shares with its Items and its Parent. */
export interface CheckboxGroupRootContextValue {
  /** The values of the checked boxes. */
  value(): string[];
  /**
   * The list set last in this turn, or `value`, untracked: for a change
   * that builds on one made earlier in the same turn.
   */
  requested(): string[];
  /** Asks to set the whole list. */
  setValue(next: string[]): void;
  /** The `name` each Item submits under. */
  name(): string | undefined;
  /** The `id` of the form the Items belong to, when they are not inside it. */
  form(): string | undefined;
  /** Whether the whole group is disabled. */
  disabled(): boolean | undefined;
}

// `null` outside a Root, so that the part can name what is missing. Solid's
// own error for a context with no provider and no default does not.
export const CheckboxGroupRootContext =
  createContext<CheckboxGroupRootContextValue | null>(null);

export function useCheckboxGroupRootContext(): CheckboxGroupRootContextValue {
  const context = useContext(CheckboxGroupRootContext);
  // Production builds drop the check, and its message, with `isDev`.
  if (isDev && !context) {
    throw new Error(
      "[menhir] CheckboxGroup parts must be placed within <CheckboxGroup.Root>.",
    );
  }
  return context!;
}
