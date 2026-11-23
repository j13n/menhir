import type { JSX } from "@solidjs/web";
import { merge, omit } from "solid-js";

import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { RenderProp } from "../../core/renderElement.tsx";
import { useComboboxContext } from "../root/ComboboxContext.ts";
import type { Combobox } from "../root/ComboboxContext.ts";
import { createComboboxItem } from "./createComboboxItem.ts";
import { ComboboxItemContext } from "./ComboboxItemContext.ts";
import type { ComboboxItemAttributes } from "./ComboboxItemContext.ts";

export interface ComboboxItemProps extends JSX.HTMLAttributes<HTMLElement> {
  /** What the Combobox's value is while this item is selected. Not `""`. */
  value: string;
  /**
   * Whether the item is disabled: still reached by the keys and the
   * pointer, but not selected.
   */
  disabled?: boolean;
  /**
   * The item's text, when its content is not its label, such as an icon
   * beside it: what the input shows once the item is selected.
   */
  label?: string;
  render?: RenderProp;
}

/**
 * A value to select: a `<div role="option">` with `aria-selected`. A click
 * selects it, sets the input's text to its label and closes the list, and
 * so does Enter while it is the active item; a disabled item is not
 * selected. Render the items that match the text, and place them inside
 * `Combobox.List`.
 */
export function ComboboxItem(props: ComboboxItemProps) {
  const combobox = useComboboxContext<Combobox>("Combobox");
  const { props: itemProps } = createComboboxItem(
    combobox,
    props,
    (element) => props.label ?? labelOf(element),
  );
  const selected = () => combobox.value() === props.value;
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
    omit(props, "render", "value", "disabled", "label", "id"),
  );
  return (
    <ComboboxItemContext value={attributes}>
      {renderElement(props, elementProps, (p) => (
        <div {...p} />
      ))}
    </ComboboxItemContext>
  );
}

/**
 * An item's own text: its text content without what is `aria-hidden`, such
 * as its ItemIndicator's check mark, which is no part of its name either.
 */
function labelOf(node: Node): string {
  let text = "";
  for (const child of node.childNodes) {
    if (child.nodeType === 3) text += child.nodeValue;
    else if ((child as Element).getAttribute?.("aria-hidden") !== "true")
      text += labelOf(child);
  }
  return text;
}
