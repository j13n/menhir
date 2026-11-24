import { isDev } from "@solidjs/web";
import type { JSX } from "@solidjs/web";
import { merge, omit } from "solid-js";

import { warnUnlessButton } from "../../core/button.ts";
import type { ButtonElementProps } from "../../core/button.ts";
import { createControllableSignal } from "../../core/createControllableSignal.ts";
import { createHiddenInput } from "../../core/hiddenInput.tsx";
import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { RenderProp } from "../../core/renderElement.tsx";
import { CheckboxRootContext } from "./CheckboxRootContext.ts";
import type { CheckboxStateAttributes } from "./CheckboxRootContext.ts";

export interface CheckboxRootProps extends JSX.HTMLAttributes<HTMLElement> {
  /** Whether the checkbox is checked, when controlled. */
  checked?: boolean;
  /** Whether the checkbox starts checked, when uncontrolled. */
  defaultChecked?: boolean;
  /**
   * Called with the new value when the user checks or unchecks the
   * checkbox, or its form is reset. When controlled, the checkbox changes
   * only if `checked` does.
   */
  onCheckedChange?: (checked: boolean) => void;
  /**
   * Whether the checkbox is partly checked, such as the parent of a group
   * whose children are only some checked. A click still asks for the
   * opposite of `checked`.
   */
  indeterminate?: boolean;
  /** Submitted with the form, as the hidden input's `name`. */
  name?: string;
  /** Submitted with the form while the checkbox is checked. The browser's default is `"on"`. */
  value?: string;
  /** Whether the checkbox ignores the user. It cannot be focused either. */
  disabled?: boolean;
  /** Whether the checkbox can be focused but not checked or unchecked. */
  readOnly?: boolean;
  /** Whether the form can be submitted only while the checkbox is checked. */
  required?: boolean;
  /** The `id` of the form the checkbox belongs to, when it is not inside it. */
  form?: string;
  render?: RenderProp;
}

/**
 * The checkbox itself: a `<button role="checkbox">`.
 */
export function CheckboxRoot(props: CheckboxRootProps) {
  const [checked, setChecked] = createControllableSignal({
    get value() {
      return props.checked;
    },
    get defaultValue() {
      return props.defaultChecked ?? false;
    },
    onChange: (value) => props.onCheckedChange?.(value),
  });
  const stateAttributes: CheckboxStateAttributes = {
    get "data-checked"() {
      return !props.indeterminate && checked() ? "" : undefined;
    },
    get "data-unchecked"() {
      return !props.indeterminate && !checked() ? "" : undefined;
    },
    get "data-indeterminate"() {
      return props.indeterminate ? "" : undefined;
    },
    get "data-disabled"() {
      return props.disabled ? "" : undefined;
    },
    get "data-readonly"() {
      return props.readOnly ? "" : undefined;
    },
    get "data-required"() {
      return props.required ? "" : undefined;
    },
  };
  const buttonProps: ButtonElementProps = {
    role: "checkbox",
    type: "button",
    get disabled() {
      return props.disabled;
    },
    // Solid 2.0 removes an attribute set to false, so spell the value out.
    get "aria-checked"() {
      if (props.indeterminate) return "mixed";
      return checked() ? "true" : "false";
    },
    get "aria-readonly"() {
      return props.readOnly ? "true" : undefined;
    },
    get "aria-required"() {
      return props.required ? "true" : undefined;
    },
    // The change goes through the hidden input, so that the form sees the
    // native `input` and `change` events a checkbox fires.
    onClick: () => input.click(),
    // A button clicks on Enter, a checkbox does not: the pattern names only
    // Space. Canceling the key down keeps the browser from clicking.
    onKeyDown: (event: KeyboardEvent) => {
      if (event.key === "Enter") event.preventDefault();
    },
    ref: (element) => {
      button = element;
      // Production builds drop the check with `isDev`.
      if (isDev) warnUnlessButton(element, "Checkbox.Root");
    },
  };
  let button: HTMLElement | undefined;
  const input = createHiddenInput(
    "checkbox",
    props,
    checked,
    setChecked,
    () => button,
    () => setChecked(props.defaultChecked ?? false),
  );
  const elementProps = mergeElementProps(
    merge(stateAttributes, buttonProps),
    omit(
      props,
      "render",
      "checked",
      "defaultChecked",
      "onCheckedChange",
      "indeterminate",
      "name",
      "value",
      "disabled",
      "readOnly",
      "required",
      "form",
    ),
  );
  return (
    <CheckboxRootContext value={stateAttributes}>
      {renderElement(props, elementProps, (p) => (
        <button {...p} />
      ))}
      {input}
    </CheckboxRootContext>
  );
}
