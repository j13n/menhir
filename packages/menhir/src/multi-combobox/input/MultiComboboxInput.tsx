import type { JSX } from "@solidjs/web";
import { omit, onFlush } from "solid-js";

import { onFormReset } from "../../core/formReset.ts";
import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { ElementProps, RenderProp } from "../../core/renderElement.tsx";
import { createComboboxInput } from "../../combobox/input/createComboboxInput.ts";
import { useComboboxContext } from "../../combobox/root/ComboboxContext.ts";
import { backKey } from "../root/MultiComboboxContext.ts";
import type { MultiCombobox } from "../root/MultiComboboxContext.ts";

export interface MultiComboboxInputProps extends JSX.HTMLAttributes<HTMLElement> {
  /** What the browser may suggest. Default `"off"`, so its list does not cover the Multi Combobox's. */
  autocomplete?: string;
  /** Shown while the input is empty. */
  placeholder?: string;
  render?: RenderProp;
}

/**
 * The combobox itself: an `<input type="text" role="combobox"
 * aria-autocomplete="list">` with `aria-expanded`, naming the List in
 * `aria-controls` and the active item in `aria-activedescendant`. Typing
 * opens and filters the list, and the arrow keys, Enter and Escape act on
 * it; Backspace in the empty input, and Left from the start of the text,
 * focus the last chip. Name it with a `<label>`. Place it inside
 * `MultiCombobox.Chips`, after the chips.
 */
export function MultiComboboxInput(props: MultiComboboxInputProps) {
  const multi = useComboboxContext<MultiCombobox>("MultiCombobox");
  // Focus leaving empties the text, the filter, unless it went to a chip.
  const input = createComboboxInput(multi, (event) => {
    for (const chip of multi.chips.values())
      if (chip === event.relatedTarget) return;
    multi.setInputValue("", { reason: "focus-out", event });
  });
  // A form reset puts a control back to its default, and so it does a
  // multi combobox: through its setters, so that a controlled one asks.
  onFormReset(
    () => multi.validityInput?.form,
    (event) => {
      multi.setValue(multi.props.defaultValue ?? []);
      multi.setInputValue(multi.props.defaultInputValue ?? "", {
        reason: "reset",
        event,
      });
      onFlush(input.syncText);
    },
    // The text, held through the browser's reset (`onFormReset`). The
    // hidden inputs' value is their attribute, which a reset keeps.
    () => {
      multi.input!.defaultValue = multi.input!.value;
    },
  );

  const ownProps = mergeElementProps(input.props, {
    onKeyDown: (event: KeyboardEvent) => {
      const element = event.currentTarget as HTMLInputElement;
      const { key } = event;
      // Only from the start of the text, with nothing selected.
      if (event.isComposing || element.selectionEnd) return;
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey)
        return;
      // Backspace only in an empty input: with the caret at the start of a
      // text, it deletes nothing, and moving would look like a slip.
      if (key === "Backspace" ? element.value : key !== backKey(element))
        return;
      const values = multi.value();
      const last = multi.chips.get(values[values.length - 1]!);
      if (!last) return;
      event.preventDefault();
      last.focus();
    },
  } satisfies ElementProps);
  // The text is not submitted: the Root's `name` is the values', and a
  // Field's goes nowhere (README, "In a Field").
  const elementProps = mergeElementProps(
    ownProps,
    omit(props, "render", "name" as keyof MultiComboboxInputProps),
  );
  return renderElement(props, elementProps, (p) => <input {...p} />);
}
