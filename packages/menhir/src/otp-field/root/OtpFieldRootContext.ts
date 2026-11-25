import { createContext, useContext } from "solid-js";
import { isDev } from "@solidjs/web";

import type { ElementProps } from "../../core/renderElement.tsx";
import type { OtpFieldRootProps } from "./OtpFieldRoot.tsx";

/** The Input's selection, `[start, end]`, while it has focus. */
export type OtpFieldSelection = readonly [start: number, end: number];

/** What the Root shares with its parts. */
export interface OtpFieldRootContextValue {
  readonly props: OtpFieldRootProps;
  /** The code, `""` when empty. */
  value(): string;
  /** Sets the code, through `onValueChange` when controlled. */
  setValue(next: string): void;
  /** The code set last in this turn, read untracked, else the value. */
  requested(): string;
  /** The Input's selection while it has focus, else `undefined`. */
  selection(): OtpFieldSelection | undefined;
  setSelection(next: OtpFieldSelection | undefined): void;
  /** Whether the pattern takes a character. */
  takes(character: string): boolean;
  /**
   * The characters of a text the pattern takes, each tried as it is, then
   * in upper case, then in lower case.
   */
  clean(text: string): string;
  /** `data-disabled`, `data-readonly` and `data-required`, for every part. */
  readonly attributes: ElementProps;
  /** The Slots' elements, by index, once rendered. */
  readonly slots: HTMLElement[];
}

// `null` outside a Root, so that the part can name what is missing. Solid's
// own error for a context with no provider and no default does not.
export const OtpFieldRootContext =
  createContext<OtpFieldRootContextValue | null>(null);

export function useOtpFieldRootContext(): OtpFieldRootContextValue {
  const context = useContext(OtpFieldRootContext);
  // Production builds drop the check, and its message, with `isDev`.
  if (isDev && !context) {
    throw new Error(
      "[menhir] OtpField parts must be placed within <OtpField.Root>.",
    );
  }
  return context!;
}
