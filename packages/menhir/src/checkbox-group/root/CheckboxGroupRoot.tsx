import type { JSX } from "@solidjs/web";
import { createUniqueId, omit } from "solid-js";

import { createControllableSignal } from "../../core/createControllableSignal.ts";
import { onFormReset } from "../../core/formReset.ts";
import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { ElementProps, RenderProp } from "../../core/renderElement.tsx";
import { CheckboxGroupRootContext } from "./CheckboxGroupRootContext.ts";
import type { CheckboxGroupRootContextValue } from "./CheckboxGroupRootContext.ts";

export interface CheckboxGroupRootProps extends JSX.HTMLAttributes<HTMLElement> {
  /** The values of the checked boxes, when controlled. `[]` for none. */
  value?: string[];
  /** The values of the boxes checked at first, when uncontrolled. */
  defaultValue?: string[];
  /**
   * Called with the new list when the user checks or unchecks a box, or
   * the form is reset. When controlled, the group changes only if `value`
   * does.
   */
  onValueChange?: (value: string[]) => void;
  /** The name each checked box is submitted under, one entry per box. */
  name?: string;
  /** Whether every box ignores the user. The fieldset is disabled too. */
  disabled?: boolean;
  /** Whether the form can be submitted only while a box is checked. */
  required?: boolean;
  /** The `id` of the form the boxes belong to, when they are not inside it. */
  form?: string;
  render?: RenderProp;
}

/**
 * The group: a `<fieldset>` around `CheckboxGroup.Item`s, named by a
 * `<legend>`, that holds the values of the checked boxes.
 */
export function CheckboxGroupRoot(props: CheckboxGroupRootProps) {
  const [value, setValue, requested] = createControllableSignal<string[]>({
    get value() {
      return props.value;
    },
    get defaultValue() {
      return props.defaultValue ?? [];
    },
    onChange: (value) => props.onValueChange?.(value),
  });
  const context: CheckboxGroupRootContextValue = {
    value,
    requested,
    setValue: (next) => setValue(next),
    name: () => props.name,
    form: () => props.form,
    disabled: () => props.disabled,
  };

  // The hidden radio's name, which the server render and hydration agree on.
  const validityName = createUniqueId();
  let root: HTMLElement | undefined;
  let input: HTMLInputElement | undefined;
  // A form reset puts the list back to its default, once, through the
  // setter, so that a controlled group asks once. Each Item's Checkbox asks
  // for nothing itself (CheckboxGroupItem).
  onFormReset(
    () => input?.form,
    () => setValue(props.defaultValue ?? []),
  );

  const ownProps: ElementProps & { disabled?: boolean } = {
    get disabled() {
      return props.disabled;
    },
    get "data-disabled"() {
      return props.disabled ? "" : undefined;
    },
    get "data-required"() {
      return props.required ? "" : undefined;
    },
    ref: (element) => {
      root = element;
    },
  };
  const elementProps = mergeElementProps(
    ownProps,
    omit(
      props,
      "render",
      "value",
      "defaultValue",
      "onValueChange",
      "name",
      "disabled",
      "required",
      "form",
    ),
  );
  return (
    <CheckboxGroupRootContext value={context}>
      {renderElement(props, elementProps, (p) => (
        <fieldset {...p} />
      ))}
      {/* "At least one" has no constraint of its own. An unchecked radio
          that is required while the list is empty blocks a submission, and
          the browser's message for it asks to select an option. Browsers
          find a radio missing only with a name, unique so that no other
          group's radio joins its radio group; unchecked, it submits nothing.
          Its `required` follows the list, not its checkedness, which a form
          reset would change behind the binding's back. */}
      <input
        type="radio"
        name={validityName}
        aria-hidden="true"
        tabindex={-1}
        style={visuallyHidden}
        disabled={props.disabled}
        required={props.required && value().length === 0}
        form={props.form}
        // The browser focuses an invalid input when it blocks a submission.
        // The user knows the boxes, not the hidden input.
        onFocus={() =>
          root?.querySelector<HTMLElement>("[role=checkbox]:enabled")?.focus()
        }
        ref={input}
      />
    </CheckboxGroupRootContext>
  );
}

// Hidden from sight but not from the form. Not `display: none`, so the
// browser can still anchor a validation message to it.
const visuallyHidden =
  "position:absolute;width:1px;height:1px;margin:-1px;padding:0;border:0;overflow:hidden;clip-path:inset(50%);white-space:nowrap;pointer-events:none";
