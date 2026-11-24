import type { JSX } from "@solidjs/web";
import { createUniqueId, omit, onFlush, untrack } from "solid-js";

import { createControllableSignal } from "../../core/createControllableSignal.ts";
import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { createRovingFocus } from "../../core/rovingFocus.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { ElementProps, RenderProp } from "../../core/renderElement.tsx";
import { RadioRootContext } from "./RadioRootContext.ts";
import type {
  RadioItemEntry,
  RadioRootContextValue,
} from "./RadioRootContext.ts";

export interface RadioRootProps extends JSX.HTMLAttributes<HTMLElement> {
  /** The checked radio's value, when controlled. `null` for none. */
  value?: string | null;
  /** The radio checked at first, when uncontrolled. */
  defaultValue?: string | null;
  /**
   * Called with the new value when the user checks a radio, or with
   * `defaultValue` when the form is reset. When controlled, the group
   * changes only if `value` does.
   */
  onValueChange?: (value: string | null) => void;
  /** The name the checked radio's value is submitted under. */
  name?: string;
  /** Whether every radio ignores the user. The fieldset is disabled too. */
  disabled?: boolean;
  /** Whether the form can be submitted only while a radio is checked. */
  required?: boolean;
  /** The `id` of the form the radios belong to, when they are not inside it. */
  form?: string;
  render?: RenderProp;
}

/**
 * The group: a `<fieldset role="radiogroup">` around `Radio.Item`s, named
 * by a `<legend>`, that holds the checked radio's value.
 */
export function RadioRoot(props: RadioRootProps) {
  const [value, setValue] = createControllableSignal<string | null>({
    get value() {
      return props.value;
    },
    get defaultValue() {
      return props.defaultValue ?? null;
    },
    onChange: (value) => props.onValueChange?.(value),
  });

  // The pattern moves on every arrow key, whatever the layout. Roving focus
  // reads one axis, so `navigate` sets it from each key: Up and Down as a
  // vertical group's, Left and Right as a horizontal one's, which roving
  // focus mirrors right to left.
  let vertical = false;
  // Whether focus is moving by an arrow key, so the Item it reaches checks.
  let moving = false;
  // Whether an Item has claimed the tab stop of the server HTML.
  let claimed = false;
  const items = new Set<RadioItemEntry>();
  const roving = createRovingFocus<RadioItemEntry>({
    get vertical() {
      return vertical;
    },
    focusable: (item) => !item.disabled(),
    preferred: (item) => item.checked(),
  });
  // After a declined change. The browser checked the clicked radio's input
  // and unchecked the checked one's, which no binding changed: this checks
  // it again, once the value has settled. The clicked one unchecks itself.
  const restore = () => {
    for (const item of items)
      if (untrack(item.checked)) item.input.checked = true;
  };

  // The hidden inputs' name, which the server render and hydration agree
  // on. Browsers find a radio missing only with a name, so a group with no
  // `name` of its own gives them this one while none is checked, when they
  // submit nothing; once one is checked, they have none again.
  const validityName = createUniqueId();
  const empty = () => value() === null;

  const context: RadioRootContextValue = {
    value,
    select: (next) => {
      setValue(next);
      onFlush(restore);
    },
    // Each Item's hidden input asks on a form reset. A set equal to the one
    // before it in the turn does nothing, so a controlled group asks once.
    reset: () => setValue(props.defaultValue ?? null),
    name: () => props.name ?? (empty() ? validityName : undefined),
    form: () => props.form,
    disabled: () => props.disabled,
    // Only while none is checked: once one is, the group is not missing,
    // and an unnamed, unchecked, required radio would be missing on its own
    // by the HTML standard. It follows the value, not the inputs'
    // checkedness, which a form reset changes behind the bindings' back.
    required: () => props.required && empty(),
    register: (item) => {
      items.add(item);
      const unregister = roving.register(item);
      return () => {
        items.delete(item);
        unregister();
      };
    },
    isTabStop: roving.isTabStop,
    // Before any Item has registered, as on the server, the checked Item
    // has the tab stop, or the first enabled one while none is checked.
    claimTabStop: (checked, disabled) =>
      !disabled &&
      (checked || (untrack(value) === null && !claimed && (claimed = true))),
    navigate: (event, from) => {
      // The pattern names no Home or End, and native radios have none.
      if (!event.key.startsWith("Arrow")) return;
      vertical = event.key === "ArrowUp" || event.key === "ArrowDown";
      moving = true;
      roving.navigate(event, from);
      moving = false;
    },
    moving: () => moving,
  };

  const ownProps: ElementProps & { disabled?: boolean } = {
    role: "radiogroup",
    get disabled() {
      return props.disabled;
    },
    get "aria-required"() {
      return props.required ? "true" : undefined;
    },
    get "data-disabled"() {
      return props.disabled ? "" : undefined;
    },
    get "data-required"() {
      return props.required ? "" : undefined;
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
    <RadioRootContext value={context}>
      {renderElement(props, elementProps, (p) => (
        <fieldset {...p} />
      ))}
    </RadioRootContext>
  );
}
