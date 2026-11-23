import { Combobox, includesText } from "menhir/combobox";
import { createMemo, createSignal, For } from "solid-js";

import "./combobox.css";

const fruits = [
  { value: "apple", label: "Apple" },
  { value: "apricot", label: "Apricot" },
  { value: "banana", label: "Banana" },
  { value: "blueberry", label: "Blueberry" },
  { value: "cherry", label: "Cherry" },
  { value: "grape", label: "Grape" },
  { value: "lemon", label: "Lemon" },
  { value: "mango", label: "Mango" },
  { value: "pear", label: "Pear" },
];

export default function ComboboxExample() {
  // The text the user typed, which the list is filtered by. A label the
  // Combobox puts in the input, after a selection, filters nothing.
  const [query, setQuery] = createSignal("");
  const shown = createMemo(() =>
    fruits.filter((fruit) => includesText(fruit.label, query())),
  );
  let field!: HTMLDivElement;
  return (
    <div class="combobox-field">
      <label
        class="combobox-label"
        for="combobox-fruit"
        id="combobox-fruit-label"
      >
        Fruit
      </label>
      <Combobox.Root
        name="fruit"
        onInputValueChange={(text, { reason }) =>
          setQuery(reason === "input-change" ? text : "")
        }
      >
        <div class="combobox-box" ref={field}>
          <Combobox.Input
            class="combobox-input"
            id="combobox-fruit"
            placeholder="Pick a fruit"
          />
          <Combobox.Clear class="combobox-button" aria-label="Clear">
            ×
          </Combobox.Clear>
          <Combobox.Trigger class="combobox-button" aria-label="Show fruits">
            ▾
          </Combobox.Trigger>
        </div>
        <Combobox.Popup
          class="combobox-popup"
          anchor={() => field}
          sideOffset={4}
        >
          <Combobox.List aria-labelledby="combobox-fruit-label">
            <For each={shown()}>
              {(fruit) => (
                <Combobox.Item class="combobox-item" value={fruit.value}>
                  <Combobox.ItemIndicator class="combobox-indicator">
                    ✓
                  </Combobox.ItemIndicator>
                  {fruit.label}
                </Combobox.Item>
              )}
            </For>
          </Combobox.List>
          <Combobox.Status class="combobox-status">
            {(count) => count === 0 && "No fruit found"}
          </Combobox.Status>
        </Combobox.Popup>
      </Combobox.Root>
    </div>
  );
}
