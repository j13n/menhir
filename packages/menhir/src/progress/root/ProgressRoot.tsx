import type { JSX } from "@solidjs/web";
import { merge, omit } from "solid-js";

import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { createRange } from "../../core/range.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { RenderProp } from "../../core/renderElement.tsx";
import { ProgressRootContext } from "./ProgressRootContext.ts";
import type { ProgressStateAttributes } from "./ProgressRootContext.ts";

export interface ProgressRootProps extends JSX.HTMLAttributes<HTMLElement> {
  /**
   * How far the task has got, from `min` to `max`, clamped to them; `null`
   * while unknown (indeterminate).
   */
  value: number | null;
  /** The value at the start of the task. Default 0. */
  min?: number;
  /** The value when the task is complete. Default 100. */
  max?: number;
  /**
   * How `aria-valuetext` and `Progress.Value` format the value, as
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
 * The progress bar itself: a `<div role="progressbar">`.
 */
export function ProgressRoot(props: ProgressRootProps) {
  const range = createRange(props, "progressbar", "--progress");
  const state = () => {
    const fraction = range.fraction();
    if (fraction === undefined) return "indeterminate";
    return fraction === 1 ? "complete" : "progressing";
  };
  const attributes: ProgressStateAttributes = {
    get "data-indeterminate"() {
      return state() === "indeterminate" ? "" : undefined;
    },
    get "data-progressing"() {
      return state() === "progressing" ? "" : undefined;
    },
    get "data-complete"() {
      return state() === "complete" ? "" : undefined;
    },
  };
  const elementProps = mergeElementProps(
    merge(attributes, range.props),
    omit(props, "render", "value", "min", "max", "format", "locale"),
  );
  return (
    <ProgressRootContext value={{ attributes, valueText: range.valueText }}>
      {renderElement(props, elementProps, (p) => (
        <div {...p} />
      ))}
    </ProgressRootContext>
  );
}
