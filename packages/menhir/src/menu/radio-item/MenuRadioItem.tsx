import { omit } from "solid-js";

import type { RenderProp } from "../../core/renderElement.tsx";
import type { MenuItemBaseProps } from "../item/menuItemProps.ts";
import { renderCheckedItem } from "../item/renderCheckedItem.tsx";
import { useMenuRadioGroupContext } from "../radio-group/MenuRadioGroup.tsx";

export interface MenuRadioItemProps extends MenuItemBaseProps {
  /** The value its group holds while it is checked. */
  value: string;
  render?: RenderProp;
}

/**
 * One of a radio group's options: a `<div role="menuitemradio">` with
 * `aria-checked`. A click and Enter check it and close every open menu;
 * Space checks it and keeps the menu open. Place it inside
 * `Menu.RadioGroup`.
 */
export function MenuRadioItem(props: MenuRadioItemProps) {
  const group = useMenuRadioGroupContext();
  return renderCheckedItem(
    props,
    omit(props, "render", "disabled", "label", "onClick", "value"),
    {
      role: "menuitemradio",
      get checked() {
        return group.value() === props.value;
      },
      onCheck: () => group.setValue(props.value),
    },
  );
}
