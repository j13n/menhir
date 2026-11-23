import type { JSX } from "@solidjs/web";

import { ComboboxContext, createCombobox } from "./ComboboxContext.ts";
import type { ComboboxStateProps } from "./ComboboxContext.ts";

export interface ComboboxRootProps extends ComboboxStateProps {
  children?: JSX.Element;
}

/**
 * An input that picks a value from a list: holds the value, the text in
 * the input and whether the list is open, and shares them with
 * `Combobox.Input`, `Combobox.Trigger`, `Combobox.Clear`, `Combobox.Popup`
 * and the parts inside it. Its form props go on the hidden input the Input
 * renders. Renders no element of its own.
 */
export function ComboboxRoot(props: ComboboxRootProps) {
  return (
    <ComboboxContext value={createCombobox(props)}>
      {props.children}
    </ComboboxContext>
  );
}
