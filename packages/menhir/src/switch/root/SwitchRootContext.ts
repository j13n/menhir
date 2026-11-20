import { createContext, useContext } from "solid-js";
import { isDev } from "@solidjs/web";

/**
 * The switch's state as `data-*` attributes, each `""` when it applies and
 * absent otherwise. Root and Thumb both spread the same object, so its
 * getters are read where each element uses them.
 */
export type SwitchStateAttributes = {
  readonly "data-checked": "" | undefined;
  readonly "data-unchecked": "" | undefined;
  readonly "data-disabled": "" | undefined;
  readonly "data-readonly": "" | undefined;
  readonly "data-required": "" | undefined;
};

// `null` outside a Root, so that the part can name what is missing. Solid's
// own error for a context with no provider and no default does not.
export const SwitchRootContext = createContext<SwitchStateAttributes | null>(
  null,
);

export function useSwitchRootContext(): SwitchStateAttributes {
  const context = useContext(SwitchRootContext);
  // Production builds drop the check, and its message, with `isDev`.
  if (isDev && !context) {
    throw new Error(
      "[menhir] Switch parts must be placed within <Switch.Root>.",
    );
  }
  return context!;
}
