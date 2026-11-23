import { createContext, useContext } from "solid-js";
import { isDev } from "@solidjs/web";

/**
 * Whether an item is selected, as `data-*` attributes, each `""` when it
 * applies and absent otherwise: what the item and its
 * `Select.ItemIndicator` carry.
 */
export type SelectItemAttributes = {
  readonly "data-selected": "" | undefined;
  readonly "data-unselected": "" | undefined;
};

// `null` outside an Item, so that the part can say so.
export const SelectItemContext = createContext<SelectItemAttributes | null>(
  null,
);

export function useSelectItemContext(): SelectItemAttributes {
  const context = useContext(SelectItemContext);
  // Production builds drop the check, and its message, with `isDev`.
  if (isDev && !context) {
    throw new Error(
      "[menhir] Select.ItemIndicator must be placed within <Select.Item>.",
    );
  }
  return context!;
}
