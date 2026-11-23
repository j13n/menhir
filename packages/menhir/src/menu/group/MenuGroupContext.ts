import { createContext, useContext } from "solid-js";
import { isDev } from "@solidjs/web";

/** What a group shares with its label. */
export interface MenuGroupContextValue {
  /**
   * Registers the `id` of a mounted GroupLabel, as a getter. Returns what
   * unregisters it, for the label's disposal.
   */
  registerLabelId(id: () => string | false): () => void;
}

// `null` outside a group, so that the part can name what is missing.
export const MenuGroupContext = createContext<MenuGroupContextValue | null>(
  null,
);

export function useMenuGroupContext(): MenuGroupContextValue {
  const context = useContext(MenuGroupContext);
  // Production builds drop the check, and its message, with `isDev`.
  if (isDev && !context) {
    throw new Error(
      "[menhir] Menu.GroupLabel must be placed within <Menu.Group> or <Menu.RadioGroup>.",
    );
  }
  return context!;
}
