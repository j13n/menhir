// A test combobox: a "Fruit" label, an Input, a Trigger and a Clear, a
// Popup with a List of Apple, Banana, Blueberry and Cherry filtered by what
// is typed, unless children are given, a Status, and a button before and
// after it.
import { createMemo, createSignal, For } from "solid-js";

import { Combobox, includesText } from "../../src/combobox/index.ts";
import type { ComboboxPopupProps } from "../../src/combobox/popup/ComboboxPopup.tsx";
import type { ComboboxRootProps } from "../../src/combobox/root/ComboboxRoot.tsx";

export const fruits = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "blueberry", label: "Blueberry" },
  { value: "cherry", label: "Cherry" },
];

export interface FruitProps extends ComboboxRootProps {
  /** Props for the Popup. */
  popup?: Omit<ComboboxPopupProps, "children">;
}

export function Fruit(props: FruitProps) {
  // Filtered by the text the user typed, and not by a label the Combobox
  // filled in (README, "Two values").
  const [query, setQuery] = createSignal("");
  const shown = createMemo(() =>
    fruits.filter((fruit) => includesText(fruit.label, query())),
  );
  return (
    <>
      <button type="button">Before</button>
      <label for="fruit" id="fruit-label">
        Fruit
      </label>
      <Combobox.Root
        value={props.value}
        defaultValue={props.defaultValue}
        onValueChange={props.onValueChange}
        inputValue={props.inputValue}
        defaultInputValue={props.defaultInputValue}
        onInputValueChange={(text, details) => {
          setQuery(details.reason === "input-change" ? text : "");
          props.onInputValueChange?.(text, details);
        }}
        open={props.open}
        defaultOpen={props.defaultOpen}
        onOpenChange={props.onOpenChange}
        name={props.name}
        form={props.form}
        required={props.required}
        disabled={props.disabled}
      >
        <Combobox.Input id="fruit" />
        <Combobox.Trigger aria-label="Show fruits">▾</Combobox.Trigger>
        <Combobox.Clear aria-label="Clear">×</Combobox.Clear>
        <Combobox.Popup
          side={props.popup?.side}
          align={props.popup?.align}
          anchor={props.popup?.anchor}
          style={props.popup?.style}
        >
          <Combobox.List aria-labelledby="fruit-label">
            {props.children ?? (
              <For each={shown()}>
                {(fruit) => (
                  <Combobox.Item value={fruit.value}>
                    {fruit.label}
                  </Combobox.Item>
                )}
              </For>
            )}
          </Combobox.List>
          <Combobox.Status data-testid="status">
            {(count) => `${count} fruits`}
          </Combobox.Status>
        </Combobox.Popup>
      </Combobox.Root>
      <button type="button">After</button>
    </>
  );
}
