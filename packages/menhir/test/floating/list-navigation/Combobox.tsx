// A test combobox for list navigation in the `aria-activedescendant` form:
// focus stays in the input, which names the active option, as Combobox
// (#103) will wire it. With `open` given, the options are in a
// `popover="manual"` popup, shown while open.
import { createUniqueId, For, onSettled, untrack } from "solid-js";

import { createActiveDescendantList } from "../../../src/floating/list-navigation/activeDescendant.ts";
import type { ItemProps, ListFixtureProps, TestItem } from "./props.ts";
import { defaultItems, listOptions, TestPopup } from "./TestList.tsx";

type Option = TestItem & { readonly id: string };

export function Combobox(props: ListFixtureProps) {
  const list = createActiveDescendantList<Option>(listOptions(props));
  // Read once: a handle on the list for the tests.
  untrack(() => props.onList)?.(list);
  return (
    <>
      <input
        role="combobox"
        aria-label="Fruit"
        aria-controls="fruit"
        aria-expanded={props.open === false ? "false" : "true"}
        aria-activedescendant={list.activeId()}
        onKeyDown={(event) => {
          const used = list.onKeyDown(event);
          props.onKeyUsed?.(used, event);
        }}
      />
      <TestPopup
        id="fruit"
        role="listbox"
        open={props.open}
        shown={props.shown}
        orientation={props.orientation}
        scroll={props.scroll}
      >
        <For each={props.items ?? defaultItems}>
          {(label) => (
            <ComboboxOption
              label={label}
              list={list}
              id={props.ids?.[label]}
              unreachable={props.unreachable}
              texts={props.texts}
              onRead={props.onRead}
            />
          )}
        </For>
      </TestPopup>
    </>
  );
}

function ComboboxOption(props: ItemProps<Option> & { id?: string }) {
  let element!: HTMLDivElement;
  // The consumer's `id`, else a generated one, registered once mounted
  // (PLAN.md section 8, "Generated ids belong to the root").
  const generated = createUniqueId();
  const id = () => props.id ?? generated;
  const item: Option = {
    get element() {
      return element;
    },
    get label() {
      return props.label;
    },
    get text() {
      return props.texts?.[props.label];
    },
    get id() {
      return id();
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
      id={id()}
      role="option"
      aria-selected="false"
      data-active={active() ? "" : undefined}
      aria-disabled={
        props.unreachable?.includes(props.label) ? "true" : undefined
      }
      style={{ height: "30px", "box-sizing": "border-box" }}
      onPointerMove={(event) => props.list.onPointerMove(item, event)}
    >
      {props.label}
    </div>
  );
}
