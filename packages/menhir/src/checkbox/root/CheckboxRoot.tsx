import { isDev } from "@solidjs/web";
import type { JSX } from "@solidjs/web";
import { merge, omit, onFlush, onSettled, untrack } from "solid-js";

import { createControllableSignal } from "../../core/createControllableSignal.ts";
import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { ElementProps, RenderProp } from "../../core/renderElement.tsx";
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
  // `type` and `disabled` are button attributes, which `ElementProps`, typed
  // for any element, does not list.
  const buttonProps: ElementProps & { type: "button"; disabled?: boolean } = {
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
    onClick: () => input?.click(),
    // A button clicks on Enter, a checkbox does not: the pattern names only
    // Space. Canceling the key down keeps the browser from clicking.
    onKeyDown: (event: KeyboardEvent) => {
      if (event.key === "Enter") event.preventDefault();
    },
    ref: (element) => {
      button = element;
      // Its keyboard support, focus and labels come from the element being
      // a button. Production builds drop the check with `isDev`.
      if (isDev && element.tagName !== "BUTTON") {
        console.warn(
          `[menhir] Checkbox.Root's render function rendered a <${element.tagName.toLowerCase()}>. ` +
            "Render a <button>, which gives the checkbox its keyboard support, focus and labels.",
        );
      }
    },
  };
  let button: HTMLElement | undefined;
  let input: HTMLInputElement | undefined;
  // Puts the input back to the checkbox's value, once that has settled.
  // The `checked` binding writes the DOM only when the value changes, so it
  // does not undo a change of the input that the checkbox did not take.
  const syncInput = () => {
    if (input) input.checked = untrack(checked);
  };
  const onInputChange = () => {
    if (!input) return;
    setChecked(input.checked);
    // The browser has already changed the input, so the form's own
    // listeners, which run after this one, see the new value. The two
    // differ afterwards only when a controlled checkbox's consumer declined
    // the change.
    onFlush(syncInput);
  };
  const onInputClick = (event: MouseEvent) => {
    // The click the button sends the input is an implementation detail:
    // ancestors already received the user's click.
    event.stopPropagation();
    // Canceling the click keeps the checkbox as it was and fires no
    // `input` or `change` event, whoever clicked it.
    if (props.readOnly) event.preventDefault();
  };
  // A form reset puts a checkbox back to its default, and so it does this
  // one: through the setter, so that a controlled checkbox asks.
  onSettled(() => {
    const form = input?.form;
    if (!form) return;
    const onReset = () => {
      setChecked(props.defaultChecked ?? false);
      // The browser resets the input after this event, to its `checked`
      // attribute, which the binding does not set. `onFlush` runs after
      // that, as the event has finished by then.
      onFlush(syncInput);
    };
    form.addEventListener("reset", onReset);
    return () => form.removeEventListener("reset", onReset);
  });
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
      <input
        type="checkbox"
        aria-hidden="true"
        tabindex={-1}
        style={visuallyHidden}
        name={props.name}
        value={props.value}
        disabled={props.disabled}
        required={props.required}
        form={props.form}
        checked={checked()}
        onChange={onInputChange}
        // The browser focuses an invalid input when it blocks a submission.
        // The user knows the checkbox, not the hidden input.
        onFocus={() => button?.focus()}
        ref={(element) => {
          input = element;
          // Solid delegates click handlers to the document, so this one is
          // a native listener, to act before the click bubbles.
          element.addEventListener("click", onInputClick);
        }}
      />
    </CheckboxRootContext>
  );
}

// Hidden from sight but not from the form. Not `display: none`, so the
// browser can still anchor a validation message to it.
const visuallyHidden =
  "position:absolute;width:1px;height:1px;margin:-1px;padding:0;border:0;overflow:hidden;clip-path:inset(50%);white-space:nowrap;pointer-events:none";
