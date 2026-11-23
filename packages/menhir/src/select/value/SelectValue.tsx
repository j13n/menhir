import type { JSX } from "@solidjs/web";
import { omit } from "solid-js";

import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { RenderProp } from "../../core/renderElement.tsx";
import { useSelectContext } from "../root/SelectContext.ts";

export interface SelectValueProps extends Omit<
  JSX.HTMLAttributes<HTMLElement>,
  "children"
> {
  /** What it shows while no item is selected. */
  placeholder?: JSX.Element;
  /**
   * The label of a value, for a Select whose labels differ from its
   * values: the server HTML cannot read a label from the items, which are
   * rendered after it. Without it, the selected item's `label` or text
   * content once the items have mounted, and the value itself before.
   */
  children?: (value: string) => JSX.Element;
  render?: RenderProp;
}

/**
 * The selected item's label: a `<span>`, with the `placeholder` and
 * `data-placeholder` while no item is selected. Place it inside
 * `Select.Trigger`.
 */
export function SelectValue(props: SelectValueProps) {
  const select = useSelectContext();
  const elementProps = mergeElementProps(
    {
      get "data-placeholder"() {
        return select.value() === null ? "" : undefined;
      },
      get children() {
        const value = select.value();
        if (value === null) return props.placeholder;
        if (props.children) return props.children(value);
        // An item's text is always given: its `label`, else its content.
        return select.selectedItem()?.text!.trim() ?? value;
      },
    },
    omit(props, "render", "placeholder", "children"),
  );
  return renderElement(props, elementProps, (p) => <span {...p} />);
}
