import type { JSX } from "@solidjs/web";
import { merge, omit, onFlush } from "solid-js";

import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { RenderProp } from "../../core/renderElement.tsx";
import {
  createComboboxInput,
  onFormReset,
} from "../../combobox/input/createComboboxInput.ts";
import { useComboboxContext } from "../../combobox/root/ComboboxContext.ts";
import type { Autocomplete } from "../root/AutocompleteContext.ts";

export interface AutocompleteInputProps extends JSX.HTMLAttributes<HTMLElement> {
  /** What the browser may suggest. Default `"off"`, so its list does not cover the Autocomplete's. */
  autocomplete?: string;
  /** Shown while the input is empty. */
  placeholder?: string;
  render?: RenderProp;
}

/**
 * The autocomplete itself, and the form's control: an `<input type="text"
 * role="combobox" aria-autocomplete="list">` that takes `name`, `form`,
 * `required` and `disabled` from the Root, so the form receives its text.
 * It keeps focus while the list is open: typing opens it, and the arrow
 * keys, Enter and Escape act on it. Name it with a `<label>`. Place it
 * inside `Autocomplete.Root`.
 */
export function AutocompleteInput(props: AutocompleteInputProps) {
  const autocomplete = useComboboxContext<Autocomplete>("Autocomplete");
  const input = createComboboxInput(autocomplete);
  onFormReset(
    () => autocomplete.input,
    (event) => {
      autocomplete.setInputValue(autocomplete.props.defaultValue ?? "", {
        reason: "reset",
        event,
      });
      onFlush(input.syncText);
    },
  );
  const ownProps = merge(input.props, {
    get name() {
      return autocomplete.props.name;
    },
    get form() {
      return autocomplete.props.form;
    },
    get required() {
      return autocomplete.props.required;
    },
  });
  const elementProps = mergeElementProps(ownProps, omit(props, "render"));
  return renderElement(props, elementProps, (p) => <input {...p} />);
}
