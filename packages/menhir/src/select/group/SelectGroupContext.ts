import { createContext, useContext } from "solid-js";
import { isDev } from "@solidjs/web";

/** What a group shares with its label. */
export interface SelectGroupContextValue {
  /**
   * Registers the `id` of a mounted GroupLabel, as a getter. Returns what
   * unregisters it, for the label's disposal.
   */
  registerLabelId(id: () => string | false): () => void;
}

// `null` outside a group, so that the part can name what is missing.
export const SelectGroupContext = createContext<SelectGroupContextValue | null>(
  null,
);

export function useSelectGroupContext(): SelectGroupContextValue {
  const context = useContext(SelectGroupContext);
  // Production builds drop the check, and its message, with `isDev`.
  if (isDev && !context) {
    throw new Error(
      "[menhir] Select.GroupLabel must be placed within <Select.Group>.",
    );
  }
  return context!;
}
