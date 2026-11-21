import type { JSX } from "@solidjs/web";
import { createMemo } from "solid-js";

import type { ElementProps } from "./renderElement.tsx";

/** The props of a part whose value lies along a range. */
export interface RangeProps {
  /** The value, clamped to `min` and `max`; `null` while unknown. */
  value: number | null;
  /** Default 0, the implicit `aria-valuemin` of WAI-ARIA's range roles. */
  min?: number;
  /** Default 100, the implicit `aria-valuemax`. */
  max?: number;
  /**
   * `Intl.NumberFormat` options for the value's text. The `percent` style,
   * the default, formats the percentage of the range; any other style
   * formats the value itself.
   */
  format?: Intl.NumberFormatOptions;
  /** The language to format in, else the runtime's default. */
  locale?: Intl.LocalesArgument;
  /**
   * The consumer's text for the value, which replaces the formatted one when
   * it is a string.
   */
  "aria-valuetext"?: JSX.HTMLAttributes<HTMLElement>["aria-valuetext"];
}

export interface Range {
  /**
   * How far along the range the value is, from 0 at `min` to 1 at `max`, or
   * `undefined` while it is `null`.
   */
  fraction: () => number | undefined;
  /**
   * The element's own props: `role`, `aria-valuemin`, `aria-valuemax`,
   * `aria-valuenow` and `aria-valuetext`, and a `style` that sets the CSS
   * custom property to the percentage of the range, such as `25%`. The
   * value's attributes and the property are absent while it is `null`.
   */
  props: ElementProps;
  /**
   * What the element announces, for a part that shows it as text: the
   * consumer's `aria-valuetext`, else the formatted value.
   */
  valueText: () => string | undefined;
}

/**
 * The value, attributes and text of a part along a range, such as
 * Progress (PLAN.md section 8, "API conventions"). Call it in the
 * part's body with the element's role; `property` names the custom
 * property, such as `--progress`.
 * Omit `value`, `min`, `max`, `format` and `locale` from the props the part
 * merges onto its element.
 */
export function createRange(
  props: RangeProps,
  role: "progressbar",
  property: `--${string}`,
): Range {
  const min = () => props.min ?? 0;
  const max = () => props.max ?? 100;
  const value = () =>
    props.value == null
      ? undefined
      : Math.min(Math.max(props.value, min()), max());
  // How far along the range the value is, from 0 to 1.
  const fraction = () => {
    const current = value();
    return current === undefined
      ? undefined
      : (current - min()) / (max() - min());
  };
  const text = createMemo(() => {
    const current = value();
    if (current === undefined) return undefined;
    const format = props.format;
    // The percent style formats a fraction: of the range, not the value.
    const percent = !format || format.style === "percent";
    return new Intl.NumberFormat(
      props.locale,
      format ?? { style: "percent" },
    ).format(percent ? fraction()! : current);
  });
  return {
    fraction,
    props: {
      role,
      get "aria-valuemin"() {
        return min();
      },
      get "aria-valuemax"() {
        return max();
      },
      get "aria-valuenow"() {
        return value();
      },
      get "aria-valuetext"() {
        return text();
      },
      get style() {
        const current = fraction();
        return {
          [property]: current === undefined ? undefined : `${current * 100}%`,
        };
      },
    },
    valueText: () => {
      const own = props["aria-valuetext"];
      return typeof own === "string" ? own : text();
    },
  };
}
