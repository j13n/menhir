import type { JSX } from "@solidjs/web";
import { omit } from "solid-js";

import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { createRange } from "../../core/range.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { RenderProp } from "../../core/renderElement.tsx";
import { MeterRootContext } from "./MeterRootContext.ts";

export interface MeterRootProps extends JSX.HTMLAttributes<HTMLElement> {
  /** The measurement, from `min` to `max`, clamped to them. */
  value: number;
  /** The lowest value the measurement can take. Default 0. */
  min?: number;
  /** The highest value the measurement can take. Default 100. */
  max?: number;
  /**
   * How `aria-valuetext` and `Meter.Value` format the value, as
   * `Intl.NumberFormat` options. The `percent` style, the default, formats
   * the percentage of the range; any other style formats the value itself.
   * A consumer's `aria-valuetext` replaces the formatted text.
   */
  format?: Intl.NumberFormatOptions;
  /**
   * The language to format in, else the runtime's default. Pass it when
   * rendering on the server, so that the server and the browser agree.
   */
  locale?: Intl.LocalesArgument;
  render?: RenderProp;
}

/**
 * The meter itself: a `<div role="meter">`.
 */
export function MeterRoot(props: MeterRootProps) {
  const range = createRange(props, "meter", "--meter");
  const elementProps = mergeElementProps(
    range.props,
    omit(props, "render", "value", "min", "max", "format", "locale"),
  );
  return (
    <MeterRootContext value={{ valueText: range.valueText }}>
      {renderElement(props, elementProps, (p) => (
        <div {...p} />
      ))}
    </MeterRootContext>
  );
}
