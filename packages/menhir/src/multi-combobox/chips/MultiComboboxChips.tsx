import type { JSX } from "@solidjs/web";
import { merge, omit } from "solid-js";

import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { ElementProps, RenderProp } from "../../core/renderElement.tsx";
import { useComboboxContext } from "../../combobox/root/ComboboxContext.ts";
import type { MultiCombobox } from "../root/MultiComboboxContext.ts";

export interface MultiComboboxChipsProps extends JSX.HTMLAttributes<HTMLElement> {
  render?: RenderProp;
}

/**
 * The box that looks like the input: a `<div>` around the chips and
 * `MultiCombobox.Input`, with the Root's `data-open` or `data-closed` and
 * `data-disabled`. A press on its own background focuses the input, and
 * the Popup is placed against it. Place it inside `MultiCombobox.Root`.
 */
export function MultiComboboxChips(props: MultiComboboxChipsProps) {
  const multi = useComboboxContext<MultiCombobox>("MultiCombobox");
  const ownProps = merge(multi.attributes, {
    onMouseDown: (event: MouseEvent) => {
      // Not on a chip or the input, which take their own presses.
      if (event.target !== event.currentTarget) return;
      event.preventDefault();
      multi.input?.focus();
    },
    ref: (element: HTMLElement) => {
      multi.box = element;
    },
  } satisfies ElementProps);
  const elementProps = mergeElementProps(ownProps, omit(props, "render"));
  return renderElement(props, elementProps, (p) => <div {...p} />);
}
