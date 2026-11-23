import type { JSX } from "@solidjs/web";

import { ComboboxContext } from "../../combobox/root/ComboboxContext.ts";
import { createAutocomplete } from "./AutocompleteContext.ts";
import type { AutocompleteStateProps } from "./AutocompleteContext.ts";

export interface AutocompleteRootProps extends AutocompleteStateProps {
  children?: JSX.Element;
}

/**
 * A text input with suggestions: holds the text, which is its value, and
 * whether the list is open, and shares them with `Autocomplete.Input`,
 * `Autocomplete.Trigger`, `Autocomplete.Clear`, `Autocomplete.Popup` and
 * the parts inside it. Its form props go on the Input. Renders no element
 * of its own.
 */
export function AutocompleteRoot(props: AutocompleteRootProps) {
  // Through Combobox's context, so that Combobox's parts work inside it.
  return (
    <ComboboxContext value={createAutocomplete(props)}>
      {props.children}
    </ComboboxContext>
  );
}
