import { isDev } from "@solidjs/web";
import type { JSX } from "@solidjs/web";
import { omit } from "solid-js";

import { warnUnlessButton } from "../../core/button.ts";
import type { ButtonElementProps } from "../../core/button.ts";
import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { RenderProp } from "../../core/renderElement.tsx";
import { useComboboxContext } from "../../combobox/root/ComboboxContext.ts";
import type { MultiCombobox } from "../root/MultiComboboxContext.ts";
import { useMultiComboboxChipContext } from "../chip/MultiComboboxChipContext.ts";

export interface MultiComboboxChipRemoveProps extends JSX.HTMLAttributes<HTMLElement> {
  render?: RenderProp;
}

/**
 * The button that takes its chip's value out, for the pointer, as
 * Backspace and Delete on the chip do from the keyboard: a `<button
 * type="button" tabindex="-1">` that then focuses the input. Name it with
 * `aria-label`, such as "Remove Olives". Place it inside
 * `MultiCombobox.Chip`.
 */
export function MultiComboboxChipRemove(props: MultiComboboxChipRemoveProps) {
  const multi = useComboboxContext<MultiCombobox>("MultiCombobox");
  const value = useMultiComboboxChipContext();
  const ownProps = {
    type: "button",
    tabindex: -1,
    get disabled() {
      return multi.props.disabled;
    },
    // Focus stays where it is, so that leaving the input does not close
    // the list or empty the text.
    onMouseDown: (event: MouseEvent) => event.preventDefault(),
    onClick: () => multi.remove(value()),
    ref: (element: HTMLElement) => {
      // Production builds drop the check with `isDev`.
      if (isDev) warnUnlessButton(element, "MultiCombobox.ChipRemove");
    },
  } satisfies ButtonElementProps & { tabindex: number };
  const elementProps = mergeElementProps(ownProps, omit(props, "render"));
  return renderElement(props, elementProps, (p) => <button {...p} />);
}
