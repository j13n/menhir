import type { JSX } from "@solidjs/web";
import { createMemo, merge, omit } from "solid-js";

import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { ElementProps, RenderProp } from "../../core/renderElement.tsx";
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
  const state = () => {
    const current = value();
    if (current === undefined) return "indeterminate";
    return current === max() ? "complete" : "progressing";
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
  const ownProps: ElementProps = {
    role: "progressbar",
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
        "--progress": current === undefined ? undefined : `${current * 100}%`,
      };
    },
  };
  const elementProps = mergeElementProps(
    merge(attributes, ownProps),
    omit(props, "render", "value", "min", "max", "format", "locale"),
  );
  return (
    <ProgressRootContext
      value={{
        attributes,
        // What the bar announces, so that Progress.Value shows it too.
        valueText: () => {
          const own = props["aria-valuetext"];
          return typeof own === "string" ? own : text();
        },
      }}
    >
      {renderElement(props, elementProps, (p) => (
        <div {...p} />
      ))}
    </ProgressRootContext>
  );
}
