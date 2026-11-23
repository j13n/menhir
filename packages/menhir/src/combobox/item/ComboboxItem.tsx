import type { JSX } from "@solidjs/web";
import { createUniqueId, merge, omit, onSettled } from "solid-js";

import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { ElementProps, RenderProp } from "../../core/renderElement.tsx";
import { useComboboxContext } from "../root/ComboboxContext.ts";
import type { ComboboxItemEntry } from "../root/ComboboxContext.ts";
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
  const combobox = useComboboxContext();
  let element!: HTMLElement;
  const generated = createUniqueId();
  // The consumer's `id`, else the generated one, which the Input names
  // while the item is active, so `false` does not remove it. Kept out of
  // the merge ("`undefined` is a value", PLAN.md section 8).
  const id = () => props.id || generated;
  const item: ComboboxItemEntry = {
    get element() {
      return element;
    },
    get id() {
      return id();
    },
    get text() {
      return props.label ?? labelOf(element);
    },
    get value() {
      return props.value;
    },
    get disabled() {
      return props.disabled;
    },
  };
  onSettled(() => combobox.list.register(item));
  const selected = () => combobox.value() === props.value;
  const attributes: ComboboxItemAttributes = {
    get "data-selected"() {
      return selected() ? "" : undefined;
    },
    get "data-unselected"() {
      return selected() ? undefined : "";
    },
  };
  const ownProps = merge(attributes, {
    role: "option",
    get id() {
      return id();
    },
    // Solid 2.0 removes an attribute set to false, so spell the value out.
    get "aria-selected"() {
      return selected() ? "true" : "false";
    },
    get "data-active"() {
      return combobox.isActive(item) ? "" : undefined;
    },
    get "aria-disabled"() {
      return props.disabled ? "true" : undefined;
    },
    get "data-disabled"() {
      return props.disabled ? "" : undefined;
    },
    onPointerMove: (event: PointerEvent) =>
      combobox.list.onPointerMove(item, event),
    onClick: (event: MouseEvent) => {
      if (combobox.select(item, event))
        combobox.setOpen(false, { reason: "item-press", event });
    },
    ref: (el: HTMLElement) => {
      element = el;
    },
  } satisfies ElementProps);
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
