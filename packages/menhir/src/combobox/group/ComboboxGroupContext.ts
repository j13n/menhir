import { createContext, useContext } from "solid-js";
import { isDev } from "@solidjs/web";

/** What a group shares with its label. */
export interface ComboboxGroupContextValue {
  /**
   * Registers the `id` of a mounted GroupLabel, as a getter. Returns what
   * unregisters it, for the label's disposal.
   */
  registerLabelId(id: () => string | false): () => void;
}

// `null` outside a group, so that the part can name what is missing.
export const ComboboxGroupContext =
  createContext<ComboboxGroupContextValue | null>(null);

export function useComboboxGroupContext(): ComboboxGroupContextValue {
  const context = useContext(ComboboxGroupContext);
  // Production builds drop the check, and its message, with `isDev`.
  if (isDev && !context) {
    throw new Error(
      "[menhir] Combobox.GroupLabel must be placed within <Combobox.Group>.",
    );
  }
  return context!;
}
