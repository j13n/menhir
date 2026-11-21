import { createContext, useContext } from "solid-js";
import { isDev } from "@solidjs/web";

/**
 * The checkbox's state as `data-*` attributes, each `""` when it applies and
 * absent otherwise. Exactly one of `data-checked`, `data-unchecked` and
 * `data-indeterminate` applies at a time. Root and Indicator both spread the
 * same object, so its getters are read where each element uses them.
 */
export type CheckboxStateAttributes = {
  readonly "data-checked": "" | undefined;
  readonly "data-unchecked": "" | undefined;
  readonly "data-indeterminate": "" | undefined;
  readonly "data-disabled": "" | undefined;
  readonly "data-readonly": "" | undefined;
  readonly "data-required": "" | undefined;
};

// `null` outside a Root, so that the part can name what is missing. Solid's
// own error for a context with no provider and no default does not.
export const CheckboxRootContext =
  createContext<CheckboxStateAttributes | null>(null);

export function useCheckboxRootContext(): CheckboxStateAttributes {
  const context = useContext(CheckboxRootContext);
  // Production builds drop the check, and its message, with `isDev`.
  if (isDev && !context) {
    throw new Error(
      "[menhir] Checkbox parts must be placed within <Checkbox.Root>.",
    );
  }
  return context!;
}
