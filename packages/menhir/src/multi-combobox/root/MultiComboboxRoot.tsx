import type { JSX } from "@solidjs/web";
import { For } from "solid-js";

import { ComboboxContext } from "../../combobox/root/ComboboxContext.ts";
import { createMultiCombobox } from "./MultiComboboxContext.ts";
import type { MultiComboboxStateProps } from "./MultiComboboxContext.ts";

export interface MultiComboboxRootProps extends MultiComboboxStateProps {
  children?: JSX.Element;
}

/**
 * An input that selects several values out of a list, each shown as a chip:
 * holds the values, the text in the input and whether the list is open, and
 * shares them with `MultiCombobox.Chips`, `MultiCombobox.Input`, the
 * buttons, `MultiCombobox.Popup` and the parts inside them. Renders no
 * element of its own: after its children, the form's view of the values, a
 * hidden input per value.
 */
export function MultiComboboxRoot(props: MultiComboboxRootProps) {
  const multi = createMultiCombobox(props);
  // Through Combobox's context, so that Combobox's parts work inside it.
  // The hidden inputs come after the children, not after the Input inside
  // the Chips: a chip and a hidden input added in one update would have
  // Solid move the Input between them, and a moved input loses focus.
  return (
    <ComboboxContext value={multi}>
      {props.children}
      <For each={multi.value()}>
        {(value) => (
          <input
            type="hidden"
            name={props.name}
            form={props.form}
            disabled={props.disabled}
            value={value}
          />
        )}
      </For>
      {/* "At least one" has no constraint of its own. An unchecked radio
          that is required while the list is empty blocks a submission, and
          the browser's message for it asks to select an option. Browsers
          find a radio missing only with a name; unchecked, it submits
          nothing. Its events tell a Field and a Form of each change. */}
      <input
        type="radio"
        aria-hidden="true"
        tabindex={-1}
        style={visuallyHidden}
        name={props.name || multi.validityName}
        form={props.form}
        disabled={props.disabled}
        required={props.required && !multi.value().length}
        // The browser focuses an invalid input when it blocks a submission.
        // The user knows the visible input, not the hidden one.
        onFocus={() => multi.input?.focus()}
        ref={(element) => {
          multi.validityInput = element;
        }}
      />
    </ComboboxContext>
  );
}

// Hidden from sight but not from the form. Not `display: none`, so the
// browser can still anchor a validation message to it.
const visuallyHidden =
  "position:absolute;width:1px;height:1px;margin:-1px;padding:0;border:0;overflow:hidden;clip-path:inset(50%);white-space:nowrap;pointer-events:none";
