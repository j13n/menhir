import type { JSX } from "@solidjs/web";
import { omit, onSettled } from "solid-js";

import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { ElementProps, RenderProp } from "../../core/renderElement.tsx";
import { useComboboxContext } from "../../combobox/root/ComboboxContext.ts";
import { backKey } from "../root/MultiComboboxContext.ts";
import type { MultiCombobox } from "../root/MultiComboboxContext.ts";
import { MultiComboboxChipContext } from "./MultiComboboxChipContext.ts";

export interface MultiComboboxChipProps extends JSX.HTMLAttributes<HTMLElement> {
  /** The value it shows, one of the Multi Combobox's. */
  value: string;
  render?: RenderProp;
}

/**
 * One selected value: a `<div tabindex="-1">`, out of the tab order and
 * named by its text, which Backspace in an empty input and Left from the
 * start of the text focus. Left and Right move between the chips and the
 * input, mirrored right to left; Backspace and Delete take its value out.
 * Place it inside `MultiCombobox.Chips`, from `MultiCombobox.Value`.
 */
export function MultiComboboxChip(props: MultiComboboxChipProps) {
  const multi = useComboboxContext<MultiCombobox>("MultiCombobox");
  let element!: HTMLElement;
  // Registered once mounted, for the keys of the input and the other chips.
  onSettled(() => {
    const value = props.value;
    multi.chips.set(value, element);
    return () => {
      if (multi.chips.get(value) === element) multi.chips.delete(value);
    };
  });
  const ownProps = {
    tabindex: -1,
    get "data-disabled"() {
      return multi.props.disabled ? "" : undefined;
    },
    onKeyDown: (event: KeyboardEvent) => {
      const { key } = event;
      if (multi.props.disabled) return;
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey)
        return;
      const values = multi.value();
      const index = values.indexOf(props.value);
      if (key === backKey(element)) {
        // None before the first.
        if (index > 0) multi.focusChip(values[index - 1]);
      } else if (key === "ArrowLeft" || key === "ArrowRight") {
        // After the last chip, the input.
        multi.focusChip(values[index + 1]);
      } else if (key === "Backspace") {
        multi.remove(props.value, values[index - 1] ?? values[index + 1]);
      } else if (key === "Delete") {
        multi.remove(props.value, values[index + 1]);
      } else return;
      event.preventDefault();
    },
    ref: (el: HTMLElement) => {
      element = el;
    },
  } satisfies ElementProps & { tabindex: number };
  const elementProps = mergeElementProps(
    ownProps,
    omit(props, "render", "value"),
  );
  return (
    <MultiComboboxChipContext value={() => props.value}>
      {renderElement(props, elementProps, (p) => (
        <div {...p} />
      ))}
    </MultiComboboxChipContext>
  );
}
