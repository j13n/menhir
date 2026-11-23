import { isDev } from "@solidjs/web";
import type { JSX } from "@solidjs/web";
import { merge, omit } from "solid-js";

import { warnUnlessButton } from "../../core/button.ts";
import type { ButtonElementProps } from "../../core/button.ts";
import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { RenderProp } from "../../core/renderElement.tsx";
import { useComboboxContext } from "../root/ComboboxContext.ts";

export interface ComboboxTriggerProps extends JSX.HTMLAttributes<HTMLElement> {
  render?: RenderProp;
}

/**
 * The button that opens and closes the list, for the pointer and touch: a
 * `<button type="button" tabindex="-1">` with `aria-expanded` and
 * `aria-controls` naming the List. Out of the tab order, since the input
 * takes the keys, and a press leaves focus in the input. Name it with
 * `aria-label`. Place it inside `Combobox.Root`.
 */
export function ComboboxTrigger(props: ComboboxTriggerProps) {
  const combobox = useComboboxContext();
  const ownProps = merge(combobox.attributes, {
    type: "button",
    tabindex: -1,
    get disabled() {
      return combobox.props.disabled;
    },
    get "aria-expanded"() {
      return combobox.open() ? "true" : "false";
    },
    "aria-controls": combobox.listId,
    // Focus stays in the input, which holds it for the keys.
    onMouseDown: (event: MouseEvent) => event.preventDefault(),
    onClick: (event: MouseEvent) => {
      combobox.setOpen(!combobox.open(), { reason: "trigger-press", event });
      combobox.input?.focus();
    },
    ref: (element: HTMLElement) => {
      // Production builds drop the check with `isDev`.
      if (isDev) warnUnlessButton(element, "Combobox.Trigger");
    },
  } satisfies ButtonElementProps & { tabindex: number });
  const elementProps = mergeElementProps(ownProps, omit(props, "render"));
  return renderElement(props, elementProps, (p) => <button {...p} />);
}
