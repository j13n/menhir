import { createContext, useContext } from "solid-js";
import { isDev } from "@solidjs/web";

/**
 * The progress bar's state as `data-*` attributes, each `""` when it applies
 * and absent otherwise. Exactly one applies at a time. Every part spreads the
 * same object, so its getters are read where each element uses them.
 */
export type ProgressStateAttributes = {
  readonly "data-indeterminate": "" | undefined;
  readonly "data-progressing": "" | undefined;
  readonly "data-complete": "" | undefined;
};

export type ProgressRootContextValue = {
  attributes: ProgressStateAttributes;
  /**
   * The Root's `aria-valuetext`: the consumer's, else the formatted value,
   * which is `undefined` while indeterminate.
   */
  valueText: () => string | undefined;
};

// `null` outside a Root, so that the part can name what is missing. Solid's
// own error for a context with no provider and no default does not.
export const ProgressRootContext =
  createContext<ProgressRootContextValue | null>(null);

export function useProgressRootContext(): ProgressRootContextValue {
  const context = useContext(ProgressRootContext);
  // Production builds drop the check, and its message, with `isDev`.
  if (isDev && !context) {
    throw new Error(
      "[menhir] Progress parts must be placed within <Progress.Root>.",
    );
  }
  return context!;
}
