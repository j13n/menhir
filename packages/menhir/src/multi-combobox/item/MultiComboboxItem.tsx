import type { JSX } from "@solidjs/web";
import { merge, omit } from "solid-js";

import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { RenderProp } from "../../core/renderElement.tsx";
import { createComboboxItem } from "../../combobox/item/createComboboxItem.ts";
import { ComboboxItemContext } from "../../combobox/item/ComboboxItemContext.ts";
import type { ComboboxItemAttributes } from "../../combobox/item/ComboboxItemContext.ts";
import { useComboboxContext } from "../../combobox/root/ComboboxContext.ts";
import type { MultiCombobox } from "../root/MultiComboboxContext.ts";

export interface MultiComboboxItemProps extends JSX.HTMLAttributes<HTMLElement> {
  /** The value it adds to the Multi Combobox's list when selected. Not `""`. */
  value: string;
  /**
   * Whether the item is disabled: still reached by the keys and the
   * pointer, but neither added nor taken out.
   */
  disabled?: boolean;
  render?: RenderProp;
}

/**
 * A value to select: a `<div role="option">` with `aria-selected`. A click
 * adds its value to the list, or takes it out once selected, and empties
 * the text; the list stays open. Enter does the same while it is the active
 * item. Render the items that match the text, and place them inside
 * `MultiCombobox.List`.
 */
export function MultiComboboxItem(props: MultiComboboxItemProps) {
  const multi = useComboboxContext<MultiCombobox>("MultiCombobox");
  // No label goes in the input: its text is only the filter.
  const { props: itemProps } = createComboboxItem(
    multi,
    props,
    () => props.value,
  );
  // The selected state as Combobox.Item has it, repeated rather than shared:
  // a helper both Items called grew Combobox by 15 B and saved nothing
  // (README, "Size").
  const selected = () => multi.value().includes(props.value);
  const attributes: ComboboxItemAttributes = {
    get "data-selected"() {
      return selected() ? "" : undefined;
    },
    get "data-unselected"() {
      return selected() ? undefined : "";
    },
  };
  const ownProps = merge(attributes, itemProps, {
    // Solid 2.0 removes an attribute set to false, so spell the value out.
    get "aria-selected"() {
      return selected() ? "true" : "false";
    },
  });
  const elementProps = mergeElementProps(
    ownProps,
    omit(props, "render", "value", "disabled", "id"),
  );
  // Combobox's context, so that Combobox's ItemIndicator works inside it.
  return (
    <ComboboxItemContext value={attributes}>
      {renderElement(props, elementProps, (p) => (
        <div {...p} />
      ))}
    </ComboboxItemContext>
  );
}
