import { isDev } from "@solidjs/web";
import type { JSX } from "@solidjs/web";
import { createMemo, merge, omit, onSettled, untrack } from "solid-js";

import { warnUnlessButton } from "../../core/button.ts";
import type { ButtonElementProps } from "../../core/button.ts";
import { createHiddenInput } from "../../core/hiddenInput.tsx";
import type { HiddenInputProps } from "../../core/hiddenInput.tsx";
import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { RenderProp } from "../../core/renderElement.tsx";
import { useRadioRootContext } from "../root/RadioRootContext.ts";
import { RadioItemContext } from "./RadioItemContext.ts";
import type { RadioStateAttributes } from "./RadioItemContext.ts";

export interface RadioItemProps extends JSX.HTMLAttributes<HTMLElement> {
  /** Identifies the radio in the group's value, and is submitted while it is checked. */
  value: string;
  /** Whether the radio ignores the user. It cannot be focused either. */
  disabled?: boolean;
  render?: RenderProp;
}

/**
 * One radio of the group: a `<button role="radio">`, checked while the
 * group's value is its `value`. Place it inside `Radio.Root`.
 */
export function RadioItem(props: RadioItemProps) {
  const group = useRadioRootContext();
  // A memo, so that a change of the value that leaves this radio as it was
  // does not run its bindings again.
  const checked = createMemo(() => group.value() === props.value);
  const disabled = () => !!(group.disabled() || props.disabled);
  let element: HTMLElement | undefined;

  const stateAttributes: RadioStateAttributes = {
    get "data-checked"() {
      return checked() ? "" : undefined;
    },
    get "data-unchecked"() {
      return checked() ? undefined : "";
    },
    get "data-disabled"() {
      return disabled() ? "" : undefined;
    },
  };
  const inputProps: HiddenInputProps = {
    get name() {
      return group.name();
    },
    get value() {
      return props.value;
    },
    get disabled() {
      return disabled();
    },
    get required() {
      return group.required();
    },
    get form() {
      return group.form();
    },
  };
  // The input's change only ever checks it: the user cannot uncheck a radio.
  const input = createHiddenInput(
    "radio",
    inputProps,
    checked,
    () => group.select(props.value),
    () => element,
    group.reset,
  );
  // Read once: the tab stop of the server HTML, and of the first render.
  const first = group.claimTabStop(untrack(checked), untrack(disabled));

  const buttonProps: ButtonElementProps = {
    role: "radio",
    type: "button",
    get disabled() {
      return disabled();
    },
    // Solid 2.0 removes an attribute set to false, so spell the value out.
    get "aria-checked"() {
      return checked() ? "true" : "false";
    },
    get tabindex() {
      return group.isTabStop(element, first) ? 0 : -1;
    },
    // The change goes through the hidden input, so that the form sees the
    // native `input` and `change` events a radio fires.
    onClick: () => input.click(),
    onKeyDown: (event: KeyboardEvent) => {
      // A button clicks on Enter, a radio does not: the pattern names only
      // Space. Canceling the key down keeps the browser from clicking.
      if (event.key === "Enter") event.preventDefault();
      else group.navigate(event, element!);
    },
    // An arrow key checks the radio it moves to; Tab and a click focus it
    // without checking it, though a click checks it then.
    onFocus: () => {
      if (group.moving()) input.click();
    },
    ref: (el) => {
      element = el;
      // Production builds drop the check with `isDev`.
      if (isDev) warnUnlessButton(el, "Radio.Item");
    },
  };
  // Mounted, so its place in the document is known.
  onSettled(() =>
    group.register({ element: element!, input, disabled, checked }),
  );
  const elementProps = mergeElementProps(
    merge(stateAttributes, buttonProps),
    omit(props, "render", "value", "disabled"),
  );
  return (
    <RadioItemContext value={stateAttributes}>
      {renderElement(props, elementProps, (p) => (
        <button {...p} />
      ))}
      {input}
    </RadioItemContext>
  );
}
