import type { JSX } from "@solidjs/web";
import { omit } from "solid-js";

import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { RenderProp } from "../../core/renderElement.tsx";
import { useComboboxContext } from "../root/ComboboxContext.ts";

export interface ComboboxStatusProps extends Omit<
  JSX.HTMLAttributes<HTMLElement>,
  "children"
> {
  /**
   * What it says for the number of items in the list, such as `(count) =>
   * count === 0 && "No results"`, shown while the list is open.
   */
  children: (count: number) => JSX.Element;
  render?: RenderProp;
}

/**
 * The number of items, said in the app's words: a `<div role="status">`, a
 * polite live region, with what its function returns while the list is
 * open, and nothing while it is closed. In `Combobox.Popup`, beside the
 * List, it is the message for an empty list; visually hidden beside the
 * input, it tells a screen reader how many items match as the user types.
 * Place it inside `Combobox.Root`.
 */
export function ComboboxStatus(props: ComboboxStatusProps) {
  const combobox = useComboboxContext();
  const elementProps = mergeElementProps(
    {
      role: "status",
      get children() {
        // Called while closed too: a function that reads pending data,
        // such as `isPending(() => results())`, reads it from the start, so
        // `<Loading>` shows its fallback then, and opening the list, which
        // would read it first, is not held until the data lands.
        const said = props.children(combobox.count());
        return combobox.open() ? said : undefined;
      },
    },
    omit(props, "render", "children"),
  );
  return renderElement(props, elementProps, (p) => <div {...p} />);
}
