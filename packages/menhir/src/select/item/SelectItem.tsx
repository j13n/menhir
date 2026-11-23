import type { JSX } from "@solidjs/web";
import { createUniqueId, merge, omit, onSettled } from "solid-js";

import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { ElementProps, RenderProp } from "../../core/renderElement.tsx";
import { useSelectContext } from "../root/SelectContext.ts";
import type { SelectItemEntry } from "../root/SelectContext.ts";
import { SelectItemContext } from "./SelectItemContext.ts";
import type { SelectItemAttributes } from "./SelectItemContext.ts";

export interface SelectItemProps extends JSX.HTMLAttributes<HTMLElement> {
  /** What the Select's value is while this item is selected. Not `""`. */
  value: string;
  /**
   * Whether the item is disabled: still reached by the keys and the
   * pointer, but not selected.
   */
  disabled?: boolean;
  /**
   * The item's text, when its content is not its label, such as an icon
   * beside it: what typeahead matches and `Select.Value` shows.
   */
  label?: string;
  render?: RenderProp;
}

/**
 * A value to select: a `<div role="option">` with `aria-selected`. A click
 * selects it and closes the list, and so do Enter, Space and Tab while it
 * is the active item; a disabled item is not selected. Place it inside
 * `Select.Popup`.
 */
export function SelectItem(props: SelectItemProps) {
  const select = useSelectContext();
  let element!: HTMLElement;
  const generated = createUniqueId();
  // The consumer's `id`, else the generated one, which the Trigger names
  // while the item is active, so `false` does not remove it. Kept out of
  // the merge ("`undefined` is a value", PLAN.md section 8).
  const id = () => props.id || generated;
  const item: SelectItemEntry = {
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
  onSettled(() => select.list.register(item));
  const selected = () => select.value() === props.value;
  const attributes: SelectItemAttributes = {
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
      return select.isActive(item) ? "" : undefined;
    },
    get "aria-disabled"() {
      return props.disabled ? "true" : undefined;
    },
    get "data-disabled"() {
      return props.disabled ? "" : undefined;
    },
    onPointerMove: (event: PointerEvent) =>
      select.list.onPointerMove(item, event),
    onClick: (event: MouseEvent) => {
      if (select.select(item))
        select.setOpen(false, { reason: "item-press", event });
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
    <SelectItemContext value={attributes}>
      {renderElement(props, elementProps, (p) => (
        <div {...p} />
      ))}
    </SelectItemContext>
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
