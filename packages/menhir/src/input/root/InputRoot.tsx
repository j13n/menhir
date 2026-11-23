import type { JSX } from "@solidjs/web";
import { merge, omit, onFlush, onSettled, untrack } from "solid-js";

import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { ElementProps, RenderProp } from "../../core/renderElement.tsx";

/** Why the text changed. */
export type InputValueChangeReason = "input-change" | "reset";

/** The second argument of `onValueChange`. */
export interface InputValueChangeDetails {
  readonly reason: InputValueChangeReason;
  /** The `input` event of an edit, or the form's `reset` event. */
  readonly event: Event;
}

export interface InputRootProps extends Omit<
  JSX.InputHTMLAttributes<HTMLInputElement>,
  "ref" | "value" | "defaultValue"
> {
  /** Typed for any element, since `render` may render a `<textarea>`. */
  ref?: JSX.Ref<HTMLElement>;
  /** The text, when controlled. */
  value?: string;
  /** The text to start with when uncontrolled, and the text a form reset puts back. */
  defaultValue?: string;
  /**
   * Called with the new text, and why, on each edit and on a form reset.
   */
  onValueChange?: (value: string, details: InputValueChangeDetails) => void;
  /** Renders the input as another element or component, such as a `<textarea>`. Read once. */
  render?: RenderProp;
}

/**
 * A text input: a native `<input>`, or what `render` renders. Name it with a
 * `<label>`, or place it in `Field.Control`'s `render`.
 */
export function InputRoot(props: InputRootProps) {
  // An `<input>`, or a `<textarea>` rendered through `render`.
  let element: HTMLInputElement | undefined;
  // Puts the element back to a controlled `value` once the consumer has
  // had its say: Solid writes `value` only when it changes, so a declined
  // edit would stay. Only when the two differ, since a write moves the
  // caret to the end.
  const restoreValue = () => {
    const value = untrack(() => props.value);
    if (element && value !== undefined && element.value !== value) {
      element.value = value;
    }
  };
  // A form reset puts a control back to its default, and so it does an
  // Input: through `onValueChange`, so that a controlled one asks.
  onSettled(() => {
    const form = element?.form;
    if (!form) return;
    const onReset = (event: Event) => {
      const text = element!.value;
      const defaultText = untrack(() => props.defaultValue) ?? "";
      // The browser resets the element to its `value` attribute after this
      // event. A controlled Input keeps its text through it, by making that
      // its attribute, so that the element never shows a text its consumer
      // does not hold; its consumer then decides.
      if (untrack(() => props.value) !== undefined) {
        element!.defaultValue = text;
      }
      // In a task of its own, not `onFlush`: when the user presses a reset
      // button, the browser runs microtasks as each listener returns,
      // before later listeners could cancel the reset.
      setTimeout(() => {
        if (event.defaultPrevented || text === defaultText) return;
        props.onValueChange?.(defaultText, { reason: "reset", event });
        onFlush(restoreValue);
      });
    };
    form.addEventListener("reset", onReset);
    return () => form.removeEventListener("reset", onReset);
  });
  const ownProps: ElementProps = {
    onInput: (event: Event) => {
      props.onValueChange?.(element!.value, { reason: "input-change", event });
      // A write while an input method composes would end the composition.
      if (!(event as InputEvent).isComposing) onFlush(restoreValue);
    },
    onCompositionEnd: () => onFlush(restoreValue),
    ref: (el: HTMLElement) => {
      element = el as HTMLInputElement;
    },
  };
  const elementProps = merge(
    mergeElementProps(
      ownProps,
      omit(
        props,
        "render",
        "value",
        "onValueChange",
      ) as JSX.HTMLAttributes<HTMLElement>,
    ),
    // Solid writes `""` for a `value` of `undefined`, which would hide
    // `defaultValue`: the key is there only while controlled.
    () => (props.value === undefined ? {} : { value: props.value }),
  ) as ElementProps;
  return renderElement(props, elementProps, (p) => <input {...p} />);
}
