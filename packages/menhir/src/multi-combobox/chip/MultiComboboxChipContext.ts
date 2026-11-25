import { isDev } from "@solidjs/web";
import { createContext, useContext } from "solid-js";

// The value of the Chip around a part, `null` outside one, so that the part
// can say so.
export const MultiComboboxChipContext = createContext<(() => string) | null>(
  null,
);

export function useMultiComboboxChipContext(): () => string {
  const context = useContext(MultiComboboxChipContext);
  // Production builds drop the check, and its message, with `isDev`.
  if (isDev && !context) {
    throw new Error(
      "[menhir] MultiCombobox.ChipRemove must be placed within <MultiCombobox.Chip>.",
    );
  }
  return context!;
}
