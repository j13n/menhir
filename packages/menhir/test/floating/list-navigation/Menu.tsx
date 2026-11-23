// A test menu for list navigation in the roving form: focus moves to the
// active item, as Menu (#99) will wire it. With `open` given, the items are
// in a `popover="manual"` popup, shown while open.
import { For, onSettled, Show, untrack } from "solid-js";

import type { ListNavigation } from "../../../src/floating/list-navigation/listNavigation.ts";
import { createRovingList } from "../../../src/floating/list-navigation/roving.ts";
import type { ItemProps, ListFixtureProps, TestItem } from "./props.ts";
import { defaultItems, listOptions, TestPopup } from "./TestList.tsx";

/** What the typeahead fixtures add to the menu's items (#98). */
export interface MenuKeys {
  /** Whether it used the key, which then goes no further. */
  onKeyDown(event: KeyboardEvent): boolean;
}

export interface MenuProps extends ListFixtureProps {
  /**
   * A test menu nested in the item with the label `in`, as a submenu sits
   * in its parent item's subtree. It takes its parent's `typeahead` unless
   * it has its own.
   */
  nested?: MenuProps & { in: string };
  /**
   * Called once with the list and the menu's props: what it returns takes
   * each item's keys before list navigation, as typeahead does in Menu
   * (#98). Read once.
   */
  typeahead?: (list: ListNavigation<TestItem>, props: MenuProps) => MenuKeys;
  /**
   * The labels of disabled items the keys still reach, as the keyboard
   * practice keeps disabled menu items (`unreachable` disables them too).
   */
  disabled?: string[];
  /**
   * Given, Space and Enter that neither typeahead nor list navigation used
   * activate the item, cancelled, and call it with the item's label.
   */
  onActivate?: (label: string) => void;
}

export function Menu(props: MenuProps) {
  const list = createRovingList<TestItem>(listOptions(props));
  // Read once: a handle on the list for the tests.
  untrack(() => props.onList)?.(list);
  const keys = untrack(() => props.typeahead)?.(list, props);
  return (
    <>
      <button type="button">Before</button>
      <TestPopup
        role="menu"
        open={props.open}
        shown={props.shown}
        orientation={props.orientation}
        scroll={props.scroll}
      >
        <For each={props.items ?? defaultItems}>
          {(label) => (
            <MenuItem
              label={label}
              list={list}
              unreachable={props.unreachable}
              disabled={props.disabled}
              texts={props.texts}
              nested={
                props.nested?.in === label
                  ? { typeahead: props.typeahead, ...props.nested }
                  : undefined
              }
              keys={keys}
              onKeyUsed={props.onKeyUsed}
              onActivate={props.onActivate}
              onRead={props.onRead}
            />
          )}
        </For>
      </TestPopup>
    </>
  );
}

function MenuItem(
  props: ItemProps &
    Pick<MenuProps, "disabled" | "onActivate"> & {
      nested?: MenuProps;
      keys?: MenuKeys;
    },
) {
  let element!: HTMLDivElement;
  const item: TestItem = {
    get element() {
      return element;
    },
    get label() {
      return props.label;
    },
    get text() {
      return props.texts?.[props.label];
    },
  };
  const active = () => {
    props.onRead?.(props.label);
    return props.list.isActive(item);
  };
  onSettled(() => props.list.register(item));
  return (
    <div
      ref={element}
      role="menuitem"
      tabindex={active() ? 0 : -1}
      data-active={active() ? "" : undefined}
      aria-disabled={
        props.unreachable?.includes(props.label) ||
        props.disabled?.includes(props.label)
          ? "true"
          : undefined
      }
      style={{ "min-height": "30px", "box-sizing": "border-box" }}
      onKeyDown={(event) => {
        if (props.keys?.onKeyDown(event)) return;
        const used = props.list.onKeyDown(event);
        props.onKeyUsed?.(used, event);
        // Only this item's own key, not one from a nested menu.
        if (used || !props.onActivate || event.target !== event.currentTarget)
          return;
        if (event.key === " " || event.key === "Enter") {
          event.preventDefault();
          props.onActivate(props.label);
        }
      }}
      onPointerMove={(event) => props.list.onPointerMove(item, event)}
    >
      {props.label}
      <Show when={props.nested}>{(nested) => <Menu {...nested()} />}</Show>
    </div>
  );
}
