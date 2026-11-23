import type { JSX } from "@solidjs/web";
import { merge } from "solid-js";

import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { RenderProp } from "../../core/renderElement.tsx";
import { MenuItemIndicatorContext } from "../item-indicator/MenuItemIndicatorContext.ts";
import type { MenuItemIndicatorAttributes } from "../item-indicator/MenuItemIndicatorContext.ts";
import { useMenuContext } from "../root/MenuContext.ts";
import { menuItemProps } from "./menuItemProps.ts";
import type { MenuItemBaseProps } from "./menuItemProps.ts";

/** What makes a checkbox or radio item, as getters and functions. */
export interface CheckedItemOptions {
  readonly role: "menuitemcheckbox" | "menuitemradio";
  /** Whether the item is checked. */
  readonly checked: boolean;
  /** Called when the item is activated: checks, or toggles, it. */
  onCheck(): void;
}

/**
 * Renders a checkbox or radio item, `Menu.CheckboxItem` and
 * `Menu.RadioItem`: an item with `aria-checked`, `data-checked` or
 * `data-unchecked`, which its `Menu.ItemIndicator` carries too. A click
 * and Enter check it and close every open menu; Space checks it and keeps
 * the menu open, as the menu pattern's optional Space does. `rest` is the
 * consumer's props, less the item's own.
 */
export function renderCheckedItem(
  props: MenuItemBaseProps & { render?: RenderProp },
  rest: JSX.HTMLAttributes<HTMLElement>,
  options: CheckedItemOptions,
): JSX.Element {
  const menu = useMenuContext();
  const attributes: MenuItemIndicatorAttributes = {
    get "data-checked"() {
      return options.checked ? "" : undefined;
    },
    get "data-unchecked"() {
      return options.checked ? undefined : "";
    },
  };
  const ownProps = merge(
    attributes,
    menuItemProps(menu, props, {
      role: options.role,
      onActivate: (event, key) => {
        options.onCheck();
        if (key?.key !== " ")
          menu.closeAll({ reason: "item-press", event: key ?? event });
      },
    }),
    {
      get "aria-checked"() {
        return options.checked ? "true" : "false";
      },
    },
  );
  const elementProps = mergeElementProps(ownProps, rest);
  return (
    <MenuItemIndicatorContext value={attributes}>
      {renderElement(props, elementProps, (p) => (
        <div {...p} />
      ))}
    </MenuItemIndicatorContext>
  );
}
