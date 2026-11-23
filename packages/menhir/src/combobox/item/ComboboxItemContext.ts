import { createContext, useContext } from "solid-js";
import { isDev } from "@solidjs/web";

/**
 * Whether an item is selected, as `data-*` attributes, each `""` when it
 * applies and absent otherwise: what the item and its
 * `Combobox.ItemIndicator` carry.
 */
export type ComboboxItemAttributes = {
  readonly "data-selected": "" | undefined;
  readonly "data-unselected": "" | undefined;
};

// `null` outside an Item, so that the part can say so.
export const ComboboxItemContext = createContext<ComboboxItemAttributes | null>(
  null,
);

export function useComboboxItemContext(): ComboboxItemAttributes {
  const context = useContext(ComboboxItemContext);
  // Production builds drop the check, and its message, with `isDev`.
  if (isDev && !context) {
    throw new Error(
      "[menhir] Combobox.ItemIndicator must be placed within <Combobox.Item>.",
    );
  }
  return context!;
}
