import { isDev } from "@solidjs/web";
import type { JSX } from "@solidjs/web";
import { flush, merge, omit, onSettled, untrack } from "solid-js";

import { createControllableSignal } from "../../core/createControllableSignal.ts";
import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { ElementProps, RenderProp } from "../../core/renderElement.tsx";
import { SwitchRootContext } from "./SwitchRootContext.ts";
import type { SwitchStateAttributes } from "./SwitchRootContext.ts";

export interface SwitchRootProps extends JSX.HTMLAttributes<HTMLElement> {
  /** Whether the switch is on, when controlled. */
  checked?: boolean;
  /** Whether the switch starts on, when uncontrolled. */
  defaultChecked?: boolean;
  /**
   * Called with the new value when the user turns the switch on or off, or
   * its form is reset. When controlled, the switch changes only if
   * `checked` does.
   */
  onCheckedChange?: (checked: boolean) => void;
  /** Submitted with the form, as the hidden input's `name`. */
  name?: string;
  /** Submitted with the form while the switch is on. The browser's default is `"on"`. */
  value?: string;
  /** Whether the switch ignores the user. It cannot be focused either. */
  disabled?: boolean;
  /** Whether the switch can be focused but not turned on or off. */
  readOnly?: boolean;
  /** Whether the form can be submitted only while the switch is on. */
  required?: boolean;
  /** The `id` of the form the switch belongs to, when it is not inside it. */
  form?: string;
  render?: RenderProp;
}

/**
 * The switch itself: a `<button role="switch">`.
 */
export function SwitchRoot(props: SwitchRootProps) {
  const [checked, setChecked] = createControllableSignal({
    get value() {
      return props.checked;
    },
    get defaultValue() {
      return props.defaultChecked ?? false;
    },
    onChange: (value) => props.onCheckedChange?.(value),
  });
  const stateAttributes: SwitchStateAttributes = {
    get "data-checked"() {
      return checked() ? "" : undefined;
    },
    get "data-unchecked"() {
      return checked() ? undefined : "";
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
    role: "switch",
    type: "button",
    get disabled() {
      return props.disabled;
    },
    // Solid 2.0 removes an attribute set to false, so spell the value out.
    get "aria-checked"() {
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
    ref: (element) => {
      button = element;
      // Its keyboard support, focus and labels come from the element being
      // a button. Production builds drop the check with `isDev`.
      if (isDev && element.tagName !== "BUTTON") {
        console.warn(
          `[menhir] Switch.Root's render function rendered a <${element.tagName.toLowerCase()}>. ` +
            "Render a <button>, which gives the switch its keyboard support, focus and labels.",
        );
      }
    },
  };
  let button: HTMLElement | undefined;
  let input: HTMLInputElement | undefined;
  const onInputChange = () => {
    if (!input) return;
    setChecked(input.checked);
    // Reads lag writes, so apply the change now: the form's own listeners
    // run after this one and must see the new value. Then put the input
    // back to the switch's value, which differs only when a controlled
    // switch's consumer declined the change: the `checked` binding writes
    // the DOM only when the value changes.
    flush();
    input.checked = checked();
  };
  const onInputClick = (event: MouseEvent) => {
    // The click the button sends the input is an implementation detail:
    // ancestors already received the user's click.
    event.stopPropagation();
    // Canceling the click keeps the checkbox as it was and fires no
    // `input` or `change` event, whoever clicked it.
    if (props.readOnly) event.preventDefault();
  };
  // A form reset puts a checkbox back to its default, and so it does the
  // switch: through the setter, so that a controlled switch asks.
  onSettled(() => {
    const form = input?.form;
    if (!form) return;
    const onReset = () => {
      setChecked(props.defaultChecked ?? false);
      // The browser resets the input after this event, to its `checked`
      // attribute, which the binding does not set. Put it back to the
      // switch's value once that and Solid's flush have happened.
      queueMicrotask(() => {
        if (input) input.checked = untrack(checked);
      });
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
      "name",
      "value",
      "disabled",
      "readOnly",
      "required",
      "form",
    ),
  );
  return (
    <SwitchRootContext value={stateAttributes}>
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
        // The user knows the switch, not the hidden input.
        onFocus={() => button?.focus()}
        ref={(element) => {
          input = element;
          // Solid delegates click handlers to the document, so this one is
          // a native listener, to act before the click bubbles.
          element.addEventListener("click", onInputClick);
        }}
      />
    </SwitchRootContext>
  );
}

// Hidden from sight but not from the form. Not `display: none`, so the
// browser can still anchor a validation message to it.
const visuallyHidden =
  "position:absolute;width:1px;height:1px;margin:-1px;padding:0;border:0;overflow:hidden;clip-path:inset(50%);white-space:nowrap;pointer-events:none";
