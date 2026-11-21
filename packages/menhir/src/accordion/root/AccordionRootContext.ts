import { createContext, useContext } from "solid-js";
import { isDev } from "@solidjs/web";

/** What the Root shares with its Items. */
export interface AccordionRootContextValue {
  /** Whether the Item with this value is open. */
  open(value: string): boolean;
  /** Asks to open or close the Item with this value. */
  setOpen(value: string, open: boolean): void;
  /** Whether every Trigger ignores the user. */
  disabled(): boolean | undefined;
}

// `null` outside a Root, so that the part can name what is missing. Solid's
// own error for a context with no provider and no default does not.
export const AccordionRootContext =
  createContext<AccordionRootContextValue | null>(null);

export function useAccordionRootContext(): AccordionRootContextValue {
  const context = useContext(AccordionRootContext);
  // Production builds drop the check, and its message, with `isDev`.
  if (isDev && !context) {
    throw new Error(
      "[menhir] Accordion.Item must be placed within <Accordion.Root>.",
    );
  }
  return context!;
}
