import { createContext, useContext } from "solid-js";
import { isDev } from "@solidjs/web";

export type MeterRootContextValue = {
  /**
   * The Root's `aria-valuetext`: the consumer's, else the formatted value,
   * which a meter always has.
   */
  valueText: () => string | undefined;
};

// `null` outside a Root, so that the part can name what is missing. Solid's
// own error for a context with no provider and no default does not.
export const MeterRootContext = createContext<MeterRootContextValue | null>(
  null,
);

export function useMeterRootContext(): MeterRootContextValue {
  const context = useContext(MeterRootContext);
  // Production builds drop the check, and its message, with `isDev`.
  if (isDev && !context) {
    throw new Error("[menhir] Meter parts must be placed within <Meter.Root>.");
  }
  return context!;
}
