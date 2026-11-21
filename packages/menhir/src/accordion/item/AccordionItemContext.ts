import { createContext, useContext } from "solid-js";
import { isDev } from "@solidjs/web";

/**
 * An Item's state as `data-*` attributes, each `""` when it applies and
 * absent otherwise: one of `data-open` and `data-closed`, and
 * `data-disabled`. Every part of the Item merges the same object, so its
 * getters are read where each element uses them.
 */
export type AccordionItemStateAttributes = {
  readonly "data-open": "" | undefined;
  readonly "data-closed": "" | undefined;
  readonly "data-disabled": "" | undefined;
};

/** What an Item shares with its Header, Trigger and Panel. */
export interface AccordionItemContextValue {
  /** Whether the Panel is shown. */
  open(): boolean;
  /** Asks to show or hide the Panel. */
  setOpen(open: boolean): void;
  /** Whether the Trigger ignores the user, by the Root's or the Item's. */
  disabled(): boolean;
  /** The Panel's `id`, which the Trigger names in `aria-controls`. */
  readonly panelId: string;
  /**
   * The Trigger's `id`, which the Panel names in `aria-labelledby`: the
   * generated one, until the Trigger, created before the Panel, replaces
   * this with one that reads the consumer's `id` first. `false`, the
   * consumer's way to remove an attribute, removes both.
   */
  triggerId: () => string | false;
  /** The `data-*` attributes every part of the Item carries. */
  readonly attributes: AccordionItemStateAttributes;
}

// `null` outside an Item, so that the part can name what is missing.
export const AccordionItemContext =
  createContext<AccordionItemContextValue | null>(null);

export function useAccordionItemContext(): AccordionItemContextValue {
  const context = useContext(AccordionItemContext);
  // Production builds drop the check, and its message, with `isDev`.
  if (isDev && !context) {
    throw new Error(
      "[menhir] Accordion parts must be placed within <Accordion.Item>.",
    );
  }
  return context!;
}
