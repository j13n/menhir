// A test menu for typeahead: list navigation's test menu in the roving
// form, with typeahead wired as Menu (#99) will. An item takes typeahead's
// keys first, then list navigation's, and activates on Space and Enter that
// neither used. A nested menu types on its own.
import { merge } from "solid-js";

import type { ListNavigation } from "../../../src/floating/list-navigation/listNavigation.ts";
import { createTypeahead } from "../../../src/floating/typeahead/typeahead.ts";
import { Menu as ListMenu, type MenuProps } from "../list-navigation/Menu.tsx";
import type { TestItem } from "../list-navigation/props.ts";
import { fruit } from "./fruit.ts";

export type { MenuProps };

const withTypeahead = (list: ListNavigation<TestItem>, props: MenuProps) =>
  createTypeahead<TestItem>({
    get open() {
      return props.open;
    },
    get items() {
      return list.items();
    },
    get active() {
      return list.active();
    },
    move: (item) => list.move(item),
  });

/** The items are `fruit` unless given. */
export function Menu(props: MenuProps) {
  const menuProps = merge({ items: fruit }, props, {
    typeahead: withTypeahead,
  });
  return <ListMenu {...menuProps} />;
}
