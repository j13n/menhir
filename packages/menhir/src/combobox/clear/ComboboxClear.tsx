import { isDev } from "@solidjs/web";
import type { JSX } from "@solidjs/web";
import { merge, omit } from "solid-js";

import { warnUnlessButton } from "../../core/button.ts";
import type { ButtonElementProps } from "../../core/button.ts";
import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { RenderProp } from "../../core/renderElement.tsx";
import { useComboboxContext } from "../root/ComboboxContext.ts";

export interface ComboboxClearProps extends JSX.HTMLAttributes<HTMLElement> {
  render?: RenderProp;
}

/**
 * The button that empties the text and the value, for the pointer, as
 * Escape on a closed list does from the keyboard: a `<button type="button"
 * tabindex="-1">` that then focuses the input. Name it with `aria-label`.
 * Place it inside `Combobox.Root`.
 */
export function ComboboxClear(props: ComboboxClearProps) {
  const combobox = useComboboxContext();
  const ownProps = merge(combobox.attributes, {
    type: "button",
    tabindex: -1,
    get disabled() {
      return combobox.props.disabled;
    },
    // Focus stays in the input, so that leaving it does not put the text
    // back before the click empties it.
    onMouseDown: (event: MouseEvent) => event.preventDefault(),
    onClick: (event: MouseEvent) => {
      combobox.clear(event, "clear-press");
      combobox.input?.focus();
    },
    ref: (element: HTMLElement) => {
      // Production builds drop the check with `isDev`.
      if (isDev) warnUnlessButton(element, "Combobox.Clear");
    },
  } satisfies ButtonElementProps & { tabindex: number });
  const elementProps = mergeElementProps(ownProps, omit(props, "render"));
  return renderElement(props, elementProps, (p) => <button {...p} />);
}
