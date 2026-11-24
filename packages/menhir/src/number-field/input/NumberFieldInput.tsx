import type { JSX } from "@solidjs/web";
import { createEffect, merge, omit } from "solid-js";

import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { ElementProps, RenderProp } from "../../core/renderElement.tsx";
import { useNumberFieldRootContext } from "../root/NumberFieldRootContext.ts";

export interface NumberFieldInputProps extends Omit<
  JSX.InputHTMLAttributes<HTMLInputElement>,
  "ref" | "id" | "value" | "defaultValue" | "type"
> {
  ref?: JSX.Ref<HTMLElement>;
  /** Renders the input with your own component, which must render an `<input>`. Read once. */
  render?: RenderProp;
}

/**
 * The spinbutton: an `<input type="text" role="spinbutton">` that shows the
 * number formatted, keeps text as it is typed, and reads it back on blur
 * and on Enter. Up, Down, Page Up, Page Down, Home and End step the number.
 * Takes the Root's `id`; place it inside `NumberField.Root`.
 */
export function NumberFieldInput(props: NumberFieldInputProps) {
  const root = useNumberFieldRootContext();
  const ownProps = merge(root.attributes, {
    type: "text",
    role: "spinbutton",
    inputmode: "decimal",
    autocomplete: "off",
    get id() {
      return root.inputId();
    },
    // The `value` attribute, not the property: a binding of `value` would
    // write the text again over the user's when any other attribute of the
    // element changes, such as a Field's `aria-invalid`. The attribute is
    // the server's text, and the text a form reset puts back; it leaves an
    // edited input alone.
    get defaultValue() {
      return root.text();
    },
    get disabled() {
      return root.props.disabled;
    },
    get readonly() {
      return root.props.readOnly;
    },
    get "aria-valuenow"() {
      return root.value() ?? undefined;
    },
    get "aria-valuetext"() {
      return root.value() === null ? undefined : root.text();
    },
    get "aria-valuemin"() {
      return root.props.min;
    },
    get "aria-valuemax"() {
      return root.props.max;
    },
    // Solid 2.0 removes an attribute set to false, so spell the value out.
    get "aria-required"() {
      return root.props.required ? ("true" as const) : undefined;
    },
    // From a Field around the Root, which is its Control.
    get "aria-describedby"() {
      return root.props["aria-describedby"];
    },
    get "aria-invalid"() {
      return root.props["aria-invalid"];
    },
    onInput: () => {
      root.edited = true;
    },
    onBlur: () => root.commit(),
    onKeyDown: (event: KeyboardEvent) => {
      const { key } = event;
      // Enter commits and goes on, so that a form submits the number. An
      // input method uses Enter to commit its own text.
      if (key === "Enter") {
        if (!event.isComposing) root.commit();
        return;
      }
      if (!root.enabled() || event.ctrlKey || event.altKey || event.metaKey)
        return;
      const limit = key === "Home" ? "min" : key === "End" ? "max" : undefined;
      if (key === "ArrowUp" || key === "ArrowDown") {
        // Shift with an arrow selects text.
        if (event.shiftKey) return;
        root.step(key === "ArrowUp" ? 1 : -1);
      } else if (key === "PageUp" || key === "PageDown") {
        root.step(key === "PageUp" ? 1 : -1, true);
      } else if (limit && root.props[limit] !== undefined) {
        root.setLimit(limit);
      } else {
        // Every other key edits the text, as the browser does.
        return;
      }
      event.preventDefault();
    },
    ref: (element: HTMLElement) => {
      root.input = element as HTMLInputElement;
    },
  }) as ElementProps;
  // The value changed, by the app or by a step: the input shows its text,
  // over any text the user had typed.
  createEffect(
    () => root.text(),
    () => root.sync(),
  );
  // Typed for an input; the merge takes any element's attributes.
  const consumerProps = omit(props, "render");
  const elementProps = mergeElementProps(
    ownProps,
    consumerProps as JSX.HTMLAttributes<HTMLElement>,
  );
  return renderElement(props, elementProps, (p) => <input {...p} />);
}
