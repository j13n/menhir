import type { JSX } from "@solidjs/web";
import { omit, onFlush, untrack } from "solid-js";

import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { RenderProp } from "../../core/renderElement.tsx";
import { useComboboxContext } from "../root/ComboboxContext.ts";
import type { Combobox } from "../root/ComboboxContext.ts";
import { createComboboxInput, onFormReset } from "./createComboboxInput.ts";

export interface ComboboxInputProps extends JSX.HTMLAttributes<HTMLElement> {
  /** What the browser may suggest. Default `"off"`, so its list does not cover the Combobox's. */
  autocomplete?: string;
  /** Shown while the input is empty. */
  placeholder?: string;
  render?: RenderProp;
}

/**
 * The combobox itself: an `<input type="text" role="combobox"
 * aria-autocomplete="list">` with `aria-expanded`, naming the List in
 * `aria-controls` and the active item in `aria-activedescendant`. It keeps
 * focus while the list is open: typing opens and filters it, and the arrow
 * keys, Enter and Escape act on it. A visually hidden `<input>` follows it,
 * the form's view of the value. Name it with a `<label>`. Place it inside
 * `Combobox.Root`.
 */
export function ComboboxInput(props: ComboboxInputProps) {
  const combobox = useComboboxContext<Combobox>("Combobox");
  const input = createComboboxInput(combobox, combobox.revert);
  let hiddenInput: HTMLInputElement | undefined;

  // A selection, which the Combobox makes through the hidden input.
  const onHiddenChange = () => {
    combobox.setValue(hiddenInput!.value || null);
    onFlush(syncHidden);
  };
  // Puts the hidden input back to the value, once that has settled.
  const syncHidden = () => {
    if (hiddenInput) hiddenInput.value = untrack(combobox.value) ?? "";
  };
  onFormReset(
    () => hiddenInput,
    (event) => {
      const value = combobox.props.defaultValue ?? null;
      combobox.setValue(value);
      combobox.setInputValue(
        combobox.props.defaultInputValue ?? combobox.labelOfValue(value) ?? "",
        { reason: "reset", event },
      );
      onFlush(() => {
        syncHidden();
        input.syncText();
      });
    },
  );

  const elementProps = mergeElementProps(input.props, omit(props, "render"));
  return (
    <>
      {renderElement(props, elementProps, (p) => (
        <input {...p} />
      ))}
      <input
        aria-hidden="true"
        tabindex={-1}
        style={visuallyHidden}
        name={combobox.props.name}
        form={combobox.props.form}
        required={combobox.props.required}
        disabled={combobox.props.disabled}
        value={combobox.value() ?? ""}
        onChange={onHiddenChange}
        // The browser focuses an invalid input when it blocks a submission.
        // The user knows the visible input, not the hidden one.
        onFocus={() => combobox.input?.focus()}
        ref={(element) => {
          hiddenInput = element;
          combobox.hiddenInput = element;
        }}
      />
    </>
  );
}

// Hidden from sight but not from the form. Not `display: none`, so the
// browser can still anchor a validation message to it.
const visuallyHidden =
  "position:absolute;width:1px;height:1px;margin:-1px;padding:0;border:0;overflow:hidden;clip-path:inset(50%);white-space:nowrap;pointer-events:none";
