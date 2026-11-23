import { omit } from "solid-js";

import { createControllableSignal } from "../../core/createControllableSignal.ts";
import type { RenderProp } from "../../core/renderElement.tsx";
import type { MenuItemBaseProps } from "../item/menuItemProps.ts";
import { renderCheckedItem } from "../item/renderCheckedItem.tsx";

export interface MenuCheckboxItemProps extends MenuItemBaseProps {
  /** Whether it is checked, when controlled. */
  checked?: boolean;
  /** Whether it is checked at first, when uncontrolled. */
  defaultChecked?: boolean;
  /**
   * Called with the new value when the user checks or unchecks it. When
   * controlled, it changes only if `checked` does.
   */
  onCheckedChange?: (checked: boolean) => void;
  render?: RenderProp;
}

/**
 * An option that is on or off: a `<div role="menuitemcheckbox">` with
 * `aria-checked`. A click and Enter change it and close every open menu;
 * Space changes it and keeps the menu open. Place it inside `Menu.Popup`.
 */
export function MenuCheckboxItem(props: MenuCheckboxItemProps) {
  const [checked, setChecked] = createControllableSignal<boolean>({
    get value() {
      return props.checked;
    },
    get defaultValue() {
      return props.defaultChecked ?? false;
    },
    onChange: (value) => props.onCheckedChange?.(value),
  });
  return renderCheckedItem(
    props,
    omit(
      props,
      "render",
      "disabled",
      "label",
      "onClick",
      "checked",
      "defaultChecked",
      "onCheckedChange",
    ),
    {
      role: "menuitemcheckbox",
      get checked() {
        return checked();
      },
      onCheck: () => setChecked(!checked()),
    },
  );
}
