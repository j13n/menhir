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
  const buttonProps: ButtonElementProps = {
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
    onClick: () => input.click(),
    ref: (element) => {
      button = element;
      // Production builds drop the check with `isDev`.
      if (isDev) warnUnlessButton(element, "Switch.Root");
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
      {input}
    </SwitchRootContext>
  );
}
