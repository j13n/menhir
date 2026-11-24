import type { JSX } from "@solidjs/web";
import {
  createMemo,
  createUniqueId,
  omit,
  onFlush,
  onSettled,
  untrack,
} from "solid-js";

import { createControllableSignal } from "../../core/createControllableSignal.ts";
import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { RenderProp } from "../../core/renderElement.tsx";
import { parseNumber } from "../parse.ts";
import { NumberFieldRootContext } from "./NumberFieldRootContext.ts";
import type { NumberFieldRootContextValue } from "./NumberFieldRootContext.ts";

export interface NumberFieldRootProps extends JSX.HTMLAttributes<HTMLElement> {
  /** The number, when controlled; `null` while the field is empty. */
  value?: number | null;
  /** The number to start with when uncontrolled, and the one a form reset puts back. */
  defaultValue?: number | null;
  /** Called with the new number when the user changes it, and on a form reset. */
  onValueChange?: (value: number | null) => void;
  /** The lowest number the user can set. */
  min?: number;
  /** The highest number the user can set. */
  max?: number;
  /** How much Up, Down and the buttons change the number. Default 1. */
  step?: number;
  /** How much Page Up and Page Down change the number. Default ten steps. */
  largeStep?: number;
  /**
   * How the Input shows the number, as `Intl.NumberFormat` options, such as
   * `{ style: "currency", currency: "EUR" }`. Typed text is read back in
   * the same format.
   */
  format?: Intl.NumberFormatOptions;
  /**
   * The language to format and parse in, else the runtime's default. Pass it
   * when rendering on the server, so that the server and the browser agree.
   */
  locale?: Intl.LocalesArgument;
  /** The name the number is submitted under. */
  name?: string;
  /** The `id` of the form the number belongs to, when the field is not inside it. */
  form?: string;
  /** Whether the form can be submitted only with a number. */
  required?: boolean;
  /** Whether every part ignores the user, and the form submits nothing. */
  disabled?: boolean;
  /** Whether the user can see and select the number, but not change it. */
  readOnly?: boolean;
  /** Renders the Root as another element or component. Read once. */
  render?: RenderProp;
}

/**
 * The number field: a `<div>` around its Input and buttons, which holds the
 * value, then a visually hidden `<input type="number">` with the plain
 * number, the form's view of it. Its `id`, `aria-describedby` and
 * `aria-invalid` go on the Input, so it joins a Field as `Field.Control`'s
 * `render`.
 */
export function NumberFieldRoot(props: NumberFieldRootProps) {
  const [value, setValue, requested] = createControllableSignal<number | null>({
    get value() {
      return props.value;
    },
    get defaultValue() {
      return props.defaultValue ?? null;
    },
    onChange: (next) => props.onValueChange?.(next),
  });
  const formatter = createMemo(
    () => new Intl.NumberFormat(props.locale, props.format),
  );
  const format = (number: number | null) =>
    number === null ? "" : formatter().format(number);
  const generatedId = createUniqueId();
  let hidden: HTMLInputElement | undefined;

  // The number rounded to `digits` decimals, to drop a float error or the
  // digits the format does not show, then clamped to `min` and `max`.
  const roundAndClamp = (number: number, digits: number) =>
    Math.min(
      Math.max(Number(number.toFixed(digits)), props.min ?? -Infinity),
      props.max ?? Infinity,
    );
  // The number as the form writes it.
  const formValue = (number: number | null) =>
    number === null ? "" : String(number);

  // Puts the Input and the hidden input back to the value, once it has
  // settled: a controlled field's consumer may have declined the change,
  // and a commit shows the value formatted, such as `1000` as `1,000`.
  const sync = () => {
    context.edited = false;
    const number = untrack(value);
    const text = untrack(() => format(number));
    if (context.input && context.input.value !== text) {
      context.input.value = text;
    }
    if (hidden) hidden.value = formValue(number);
  };
  // A change by the user. The hidden input changes first and fires its
  // native events, as a native control does, so the form's listeners, a
  // Field and a Form see the new number.
  const change = (next: number | null) => {
    const before = hidden?.value;
    if (hidden) hidden.value = formValue(next);
    setValue(next);
    if (hidden && hidden.value !== before) {
      hidden.dispatchEvent(new Event("input", { bubbles: true }));
      hidden.dispatchEvent(new Event("change", { bubbles: true }));
    }
    onFlush(sync);
  };
  // The number the user's text says, if edited, else the value set last.
  const current = () => {
    if (context.edited && context.input) {
      const parsed = parseNumber(formatter(), context.input.value);
      if (!Number.isNaN(parsed)) return parsed;
    }
    return requested();
  };
  // Decimal places of a number, to round a step's float error away.
  const places = (number = 0) => (String(number).split(".")[1] ?? "").length;

  const context: NumberFieldRootContextValue = {
    props,
    value,
    text: () => format(value()),
    inputId: () => props.id || generatedId,
    attributes: {
      get "data-disabled"() {
        return props.disabled ? "" : undefined;
      },
      get "data-readonly"() {
        return props.readOnly ? "" : undefined;
      },
      get "data-required"() {
        return props.required ? "" : undefined;
      },
    },
    edited: false,
    sync,
    enabled: () => !props.disabled && !props.readOnly,
    canStep: (direction) => {
      const number = value();
      const limit = direction > 0 ? props.max : props.min;
      return (
        context.enabled() &&
        (number === null ||
          limit === undefined ||
          (direction > 0 ? number < limit : number > limit))
      );
    },
    step: (direction, large) => {
      const size = props.step ?? 1;
      const amount = large ? (props.largeStep ?? size * 10) : size;
      const origin = props.min ?? 0;
      // From a number off the grid, the grid's next one that way, as
      // `stepUp()` does; from none, 0, as on an empty number input.
      const steps = ((current() ?? 0) - origin) / size;
      const onGrid =
        direction > 0 ? Math.floor(steps + 1e-9) : Math.ceil(steps - 1e-9);
      const next = origin + onGrid * size + direction * amount;
      change(
        roundAndClamp(
          next,
          Math.max(places(size), places(origin), places(amount)),
        ),
      );
    },
    setLimit: (limit) => {
      const number = props[limit];
      if (number !== undefined) change(number);
    },
    commit: () => {
      if (!context.edited || !context.input) return;
      const text = context.input.value.trim();
      const parsed = text ? parseNumber(formatter(), text) : null;
      // Text that is not a number goes back to the value's.
      if (Number.isNaN(parsed)) return sync();
      if (parsed === null) return change(null);
      // Rounded to the digits the format shows, so the value is what the
      // user sees: a percentage shows two digits fewer than it has.
      const options = formatter().resolvedOptions();
      change(
        roundAndClamp(
          parsed,
          options.maximumFractionDigits! +
            (options.style === "percent" ? 2 : 0),
        ),
      );
    },
  };

  // A form reset puts a control back to its default, and so it does this
  // one: through the setter, so that a controlled field asks.
  onSettled(() => {
    const form = hidden?.form;
    if (!form) return;
    // A field the reset removes, such as a row of a list going back to its
    // default length, asks for nothing.
    let disposed = false;
    const onReset = (event: Event) => {
      // In a task of its own, not `onFlush`: when the user presses a reset
      // button, the browser runs microtasks as each listener returns,
      // before it resets the controls and before later listeners could
      // cancel the reset (src/input/README.md).
      setTimeout(() => {
        if (disposed || event.defaultPrevented) return;
        setValue(props.defaultValue ?? null);
        onFlush(sync);
      });
    };
    form.addEventListener("reset", onReset);
    return () => {
      disposed = true;
      form.removeEventListener("reset", onReset);
    };
  });

  const elementProps = mergeElementProps(
    context.attributes,
    omit(
      props,
      "render",
      "value",
      "defaultValue",
      "onValueChange",
      "min",
      "max",
      "step",
      "largeStep",
      "format",
      "locale",
      "name",
      "form",
      "required",
      "disabled",
      "readOnly",
      "id",
      "aria-describedby",
      "aria-invalid",
    ),
  );
  return (
    <NumberFieldRootContext value={context}>
      {renderElement(props, elementProps, (p) => (
        <div {...p} />
      ))}
      <input
        type="number"
        aria-hidden="true"
        tabindex={-1}
        style={visuallyHidden}
        name={props.name}
        form={props.form}
        min={props.min}
        max={props.max}
        // Without a `step`, any number is valid, as a currency's cents
        // are: the field formats decimals by default. The keys still step
        // by 1.
        step={props.step ?? "any"}
        required={props.required}
        disabled={props.disabled}
        readonly={props.readOnly}
        value={formValue(value())}
        // The browser focuses an invalid input when it blocks a submission.
        // The user knows the Input, not the hidden input.
        onFocus={() => context.input?.focus()}
        ref={(element) => {
          hidden = element;
        }}
      />
    </NumberFieldRootContext>
  );
}

// Hidden from sight but not from the form. Not `display: none`, so the
// browser can still anchor a validation message to it.
const visuallyHidden =
  "position:absolute;width:1px;height:1px;margin:-1px;padding:0;border:0;overflow:hidden;clip-path:inset(50%);white-space:nowrap;pointer-events:none";
