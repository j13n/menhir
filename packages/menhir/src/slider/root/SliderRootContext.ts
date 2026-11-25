import { createContext, useContext } from "solid-js";
import { isDev } from "@solidjs/web";

import type { ElementProps } from "../../core/renderElement.tsx";
import type { SliderRootProps } from "./SliderRoot.tsx";

/** What the Root shares with its parts. */
export interface SliderRootContextValue {
  readonly props: SliderRootProps;
  /** The value. */
  value(): number;
  /** The value set last in this turn, else the value; untracked. */
  requested(): number;
  /** `min`, default 0. */
  min(): number;
  /** `max`, default 100. */
  max(): number;
  /** `step`, default 1. */
  stepSize(): number;
  /** The value as text: in `format` and `locale`, or `format`'s own. */
  text(): string;
  /**
   * `data-disabled` and `data-horizontal` or `data-vertical`, for every
   * part.
   */
  readonly attributes: ElementProps;
  /** The Thumb's range input, once rendered. */
  input?: HTMLInputElement;
  /** The Thumb's element, once rendered. */
  thumb?: HTMLElement;
  /**
   * Sets the value by the user's hand, rounded to the step grid with
   * `round`, by default to the nearest value, and clamped to the range.
   */
  change(value: number, round?: (steps: number) => number): void;
  /**
   * Moves the value by `amount`, to the step grid's next value that way,
   * clamped to the range.
   */
  step(amount: number): void;
  /**
   * Marks the start of a change under way, a drag or a key held, which
   * ends in a commit. Several may overlap, such as a key during a drag;
   * each calls `end` once.
   */
  begin(): void;
  /**
   * Ends a change under way. Once the last has ended, if the value is not
   * what it was when the first began, fires the input's `change` and calls
   * `onValueCommit`.
   */
  end(): void;
}

// `null` outside a Root, so that the part can name what is missing. Solid's
// own error for a context with no provider and no default does not.
export const SliderRootContext = createContext<SliderRootContextValue | null>(
  null,
);

export function useSliderRootContext(): SliderRootContextValue {
  const context = useContext(SliderRootContext);
  // Production builds drop the check, and its message, with `isDev`.
  if (isDev && !context) {
    throw new Error(
      "[menhir] Slider parts must be placed within <Slider.Root>.",
    );
  }
  return context!;
}
