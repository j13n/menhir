import type { JSX } from "@solidjs/web";
import { merge, omit, onSettled, untrack } from "solid-js";

import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { RenderProp } from "../../core/renderElement.tsx";
import { toggleButtonProps } from "../../core/toggleButton.ts";
import { useToggleGroupRootContext } from "../root/ToggleGroupRootContext.ts";

export interface ToggleGroupItemProps extends JSX.HTMLAttributes<HTMLElement> {
  /** Identifies the item in the group's value. */
  value: string;
  /** Whether the item ignores the user. It cannot be focused either. */
  disabled?: boolean;
  render?: RenderProp;
}

/**
 * One toggle button of the group: a `<button aria-pressed>`. Place it
 * inside `ToggleGroup.Root`.
 */
export function ToggleGroupItem(props: ToggleGroupItemProps) {
  const group = useToggleGroupRootContext();
  let element: HTMLElement | undefined;
  const own = toggleButtonProps(
    {
      get value() {
        return group.pressed(props.value);
      },
      get disabled() {
        return !!(group.disabled() || props.disabled);
      },
      setValue: (pressed) => group.press(props.value, pressed),
    },
    "ToggleGroup.Item",
  );
  // Read once: the tab stop of the server HTML, and of the first render.
  const first = group.claimTabStop(untrack(() => own.disabled!));
  const itemProps = merge(own, {
    get tabindex() {
      return group.isTabStop(element, first) ? 0 : -1;
    },
    onFocus: () => group.setActive(element!),
    onKeyDown: (event: KeyboardEvent) => group.navigate(event, element!),
    ref: (el: HTMLElement) => {
      element = el;
      own.ref!(el);
    },
  });
  // Mounted, so its place in the document is known.
  onSettled(() =>
    group.register({ element: element!, disabled: () => own.disabled! }),
  );
  const elementProps = mergeElementProps(
    itemProps,
    omit(props, "render", "value", "disabled"),
  );
  return renderElement(props, elementProps, (p) => <button {...p} />);
}
