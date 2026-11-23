// A test menu for list navigation in the roving form: focus moves to the
// active item, as Menu (#99) will wire it. With `open` given, the items are
// in a `popover="manual"` popup, shown while open.
import { For, onSettled, Show, untrack } from "solid-js";

import { createRovingList } from "../../../src/floating/list-navigation/roving.ts";
import type { ItemProps, ListFixtureProps, TestItem } from "./props.ts";
import { defaultItems, listOptions, TestPopup } from "./TestList.tsx";

export interface MenuProps extends ListFixtureProps {
  /**
   * A test menu nested in the item with the label `in`, as a submenu sits
   * in its parent item's subtree.
   */
  nested?: MenuProps & { in: string };
}

export function Menu(props: MenuProps) {
  const list = createRovingList<TestItem>(listOptions(props));
  // Read once: a handle on the list for the tests.
  untrack(() => props.onList)?.(list);
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
              texts={props.texts}
              nested={props.nested?.in === label ? props.nested : undefined}
              onKeyUsed={props.onKeyUsed}
              onRead={props.onRead}
            />
          )}
        </For>
      </TestPopup>
    </>
  );
}

function MenuItem(props: ItemProps & { nested?: MenuProps }) {
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
        props.unreachable?.includes(props.label) ? "true" : undefined
      }
      style={{ "min-height": "30px", "box-sizing": "border-box" }}
      onKeyDown={(event) => {
        const used = props.list.onKeyDown(event);
        props.onKeyUsed?.(used, event);
      }}
      onPointerMove={(event) => props.list.onPointerMove(item, event)}
    >
      {props.label}
      <Show when={props.nested}>{(nested) => <Menu {...nested()} />}</Show>
    </div>
  );
}
