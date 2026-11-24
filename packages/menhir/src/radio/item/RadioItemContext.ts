import { createContext, useContext } from "solid-js";
import { isDev } from "@solidjs/web";

/**
 * The radio's state as `data-*` attributes, each `""` when it applies and
 * absent otherwise. Item and Indicator both spread the same object, so its
 * getters are read where each element uses them.
 */
export type RadioStateAttributes = {
  readonly "data-checked": "" | undefined;
  readonly "data-unchecked": "" | undefined;
  readonly "data-disabled": "" | undefined;
};

// `null` outside an Item, so that the part can name what is missing.
export const RadioItemContext = createContext<RadioStateAttributes | null>(
  null,
);

export function useRadioItemContext(): RadioStateAttributes {
  const context = useContext(RadioItemContext);
  // Production builds drop the check, and its message, with `isDev`.
  if (isDev && !context) {
    throw new Error(
      "[menhir] Radio.Indicator must be placed within <Radio.Item>.",
    );
  }
  return context!;
}
