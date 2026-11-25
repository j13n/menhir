import type { JSX } from "@solidjs/web";
import { createMemo, merge, omit, onFlush, onSettled, untrack } from "solid-js";

import { createControllableSignal } from "../../core/createControllableSignal.ts";
import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { ElementProps, RenderProp } from "../../core/renderElement.tsx";
import { SliderRootContext } from "./SliderRootContext.ts";
import type { SliderRootContextValue } from "./SliderRootContext.ts";

export interface SliderRootProps extends JSX.HTMLAttributes<HTMLElement> {
  /** The value, when controlled. */
  value?: number;
  /**
   * The value to start with when uncontrolled, and the one a form reset
   * puts back. Default the midpoint of `min` and `max`, as a range input's.
   */
  defaultValue?: number;
  /** Called with the new value on each change while the thumb moves. */
  onValueChange?: (value: number) => void;
  /**
   * Called with the value once the user has finished changing it: a drag
   * released or canceled, a key released or focus leaving first, the
   * input's own `change`, a form reset once taken.
   */
  onValueCommit?: (value: number) => void;
  /** The lowest value. Default 0. */
  min?: number;
  /** The highest value. Default 100. */
  max?: number;
  /** The distance between the values the thumb can take. Default 1. */
  step?: number;
  /** How much Page Up and Page Down change the value. Default ten steps. */
  largeStep?: number;
  /** The direction of the track. Default `"horizontal"`. */
  orientation?: "horizontal" | "vertical";
  /**
   * How the value reads as text, in `aria-valuetext` and `Slider.Value`:
   * `Intl.NumberFormat` options, such as `{ useGrouping: false }` for a
   * year, or a function from the value to its text, such as a month's name.
   */
  format?: Intl.NumberFormatOptions | ((value: number) => string);
  /**
   * The language to format in, else the runtime's default. Pass it when
   * rendering on the server, so that the server and the browser agree.
   */
  locale?: Intl.LocalesArgument;
  /** The name the value is submitted under. */
  name?: string;
  /** The `id` of the form the value belongs to, when the slider is not inside it. */
  form?: string;
  /** Whether every part ignores the user, and the form submits nothing. */
  disabled?: boolean;
  /** Renders the Root as another element or component. Read once. */
  render?: RenderProp;
}

// Decimal places of a number, to round a step's float error away.
const places = (number: number) => (String(number).split(".")[1] ?? "").length;

/**
 * The slider: a `<div>` around its parts, which holds the value and sets
 * `--slider` to its percentage of the range. Its `id`, `aria-describedby`
 * and `aria-invalid` go on the Thumb's input, so it joins a Field as
 * `Field.Control`'s `render`.
 */
export function SliderRoot(props: SliderRootProps) {
  const min = () => props.min ?? 0;
  const max = () => props.max ?? 100;
  const stepSize = () => props.step ?? 1;
  // The value on the step grid from `min` nearest `number` by `round`,
  // clamped to the range: the last value is the grid's last at or under
  // `max`, as a range input's is. Rounded to the decimals of `step` and
  // `min`, so that `0.1` steps add up.
  const snap = (number: number, round: (steps: number) => number) => {
    const step = stepSize();
    const steps = Math.min(
      Math.max(round((number - min()) / step), 0),
      Math.floor((max() - min()) / step + 1e-9),
    );
    return Number(
      (min() + steps * step).toFixed(Math.max(places(step), places(min()))),
    );
  };
  // As a range input's: the midpoint, on the grid.
  const defaultValue = () =>
    props.defaultValue ?? snap((min() + max()) / 2, Math.round);
  const [value, setValue, requested] = createControllableSignal<number>({
    get value() {
      return props.value;
    },
    get defaultValue() {
      return defaultValue();
    },
    onChange: (next) => props.onValueChange?.(next),
  });
  const formatText = createMemo(() => {
    const format = props.format;
    if (typeof format === "function") return format;
    const formatter = new Intl.NumberFormat(props.locale, format);
    return (number: number) => formatter.format(number);
  });

  // Puts the input back to the value, once it has settled: a controlled
  // slider's consumer may have declined the change, and a form reset set
  // the input to its `value` attribute.
  const sync = () => {
    if (context.input) context.input.value = String(untrack(value));
  };
  const fire = (type: string) =>
    context.input?.dispatchEvent(new Event(type, { bubbles: true }));
  // The value when the first of the changes under way began, and how many
  // are under way: a drag, a key held during it. The last to end commits.
  let start = 0;
  let holds = 0;

  const context: SliderRootContextValue = {
    props,
    value,
    requested,
    min,
    max,
    stepSize,
    text: () => formatText()(value()),
    attributes: {
      get "data-disabled"() {
        return props.disabled ? "" : undefined;
      },
      get "data-horizontal"() {
        return props.orientation === "vertical" ? undefined : "";
      },
      get "data-vertical"() {
        return props.orientation === "vertical" ? "" : undefined;
      },
    },
    change: (number, round = Math.round) => {
      const next = snap(number, round);
      if (next === requested()) return;
      // The input changes first and fires its native `input`, as a range
      // input does under a drag, so the form's listeners, a Field and a
      // Form see the new value.
      if (context.input) context.input.value = String(next);
      setValue(next);
      fire("input");
      onFlush(sync);
    },
    // From a value off the grid, the grid's next one that way, as
    // `stepUp()` does.
    step: (amount) =>
      context.change(
        requested() + amount,
        amount > 0
          ? (steps) => Math.floor(steps + 1e-9)
          : (steps) => Math.ceil(steps - 1e-9),
      ),
    begin: () => {
      if (!holds++) start = requested();
    },
    end: () => {
      if (--holds) return;
      const current = requested();
      if (current === start) return;
      fire("change");
      props.onValueCommit?.(current);
    },
  };

  // A form reset puts a control back to its default, and so it does this
  // one: through the setter, so that a controlled slider asks.
  onSettled(() => {
    const form = context.input?.form;
    if (!form) return;
    // A slider the reset removes, such as a row of a list going back to its
    // default length, asks for nothing.
    let disposed = false;
    const onReset = (event: Event) => {
      // In a task of its own, not `onFlush`: when the user presses a reset
      // button, the browser runs microtasks as each listener returns,
      // before it resets the controls and before later listeners could
      // cancel the reset (src/input/README.md).
      setTimeout(() => {
        if (disposed || event.defaultPrevented) return;
        const before = requested();
        setValue(defaultValue());
        onFlush(() => {
          sync();
          // Once taken: a controlled slider may decline it.
          const current = untrack(value);
          if (current !== before) props.onValueCommit?.(current);
        });
      });
    };
    form.addEventListener("reset", onReset);
    return () => {
      disposed = true;
      form.removeEventListener("reset", onReset);
    };
  });

  const ownProps = merge(context.attributes, {
    get style() {
      const fraction =
        (Math.min(Math.max(value(), min()), max()) - min()) / (max() - min());
      return { "--slider": `${fraction * 100}%` };
    },
  }) as ElementProps;
  const elementProps = mergeElementProps(
    ownProps,
    omit(
      props,
      "render",
      "value",
      "defaultValue",
      "onValueChange",
      "onValueCommit",
      "min",
      "max",
      "step",
      "largeStep",
      "orientation",
      "format",
      "locale",
      "name",
      "form",
      "disabled",
      "id",
      "aria-describedby",
      "aria-invalid",
    ),
  );
  return (
    <SliderRootContext value={context}>
      {renderElement(props, elementProps, (p) => (
        <div {...p} />
      ))}
    </SliderRootContext>
  );
}
