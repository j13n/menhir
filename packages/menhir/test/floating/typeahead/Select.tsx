// A test select for typeahead, as the select-only combobox example wires
// it: focus stays on the trigger, which names the active option in
// `aria-activedescendant`. A printable character on the closed trigger
// opens it; Escape closes it, and only a click on an option changes the
// value. The options are in a `popover="manual"` popup, shown while open.
import {
  createSignal,
  createUniqueId,
  For,
  onSettled,
  untrack,
} from "solid-js";

import { createActiveDescendantList } from "../../../src/floating/list-navigation/activeDescendant.ts";
import { createTypeahead } from "../../../src/floating/typeahead/typeahead.ts";
import type { TestItem } from "../list-navigation/props.ts";
import { TestPopup } from "../list-navigation/TestList.tsx";
import { fruit } from "./fruit.ts";

type Option = TestItem & { readonly id: string };

export interface SelectProps {
  /** The value it starts with, read once. */
  defaultValue?: string;
}

export function Select(props: SelectProps) {
  const [open, setOpen] = createSignal(false);
  const [value, setValue] = createSignal(untrack(() => props.defaultValue));
  const list = createActiveDescendantList<Option>({
    get open() {
      return open();
    },
  });
  const typeahead = createTypeahead<Option>({
    get open() {
      return open();
    },
    get items() {
      return list.items();
    },
    get active() {
      return list.active();
    },
    move: (item) => list.move(item),
  });
  return (
    <>
      <button
        type="button"
        role="combobox"
        aria-label="Fruit"
        aria-controls="fruit-options"
        aria-expanded={open() ? "true" : "false"}
        aria-activedescendant={list.activeId()}
        onKeyDown={(event) => {
          if (typeahead.onKeyDown(event)) {
            // The move made while closed waits for it to open (#97).
            if (!open()) setOpen(true);
            return;
          }
          if (event.key === "Escape") setOpen(false);
          else list.onKeyDown(event);
        }}
      >
        {value() ?? "Pick a fruit"}
      </button>
      <TestPopup id="fruit-options" role="listbox" open={open()}>
        <For each={fruit}>
          {(label) => {
            let element!: HTMLDivElement;
            const id = createUniqueId();
            const option: Option = {
              get element() {
                return element;
              },
              label,
              id,
            };
            onSettled(() => list.register(option));
            return (
              <div
                ref={element}
                id={id}
                role="option"
                aria-selected={value() === label ? "true" : "false"}
                data-active={list.isActive(option) ? "" : undefined}
                onClick={() => {
                  setValue(label);
                  setOpen(false);
                }}
              >
                {label}
              </div>
            );
          }}
        </For>
      </TestPopup>
    </>
  );
}
