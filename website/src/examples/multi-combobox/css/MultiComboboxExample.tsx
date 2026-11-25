import { includesText, MultiCombobox } from "menhir/multi-combobox";
import { createMemo, createSignal, For } from "solid-js";

import "./multi-combobox.css";

const toppings = [
  { value: "basil", label: "Basil" },
  { value: "cheese", label: "Cheese" },
  { value: "garlic", label: "Garlic" },
  { value: "ham", label: "Ham" },
  { value: "mushrooms", label: "Mushrooms" },
  { value: "olives", label: "Olives" },
  { value: "onions", label: "Onions" },
  { value: "peppers", label: "Peppers" },
  { value: "pineapple", label: "Pineapple" },
];

const labelOf = (value: string) =>
  toppings.find((topping) => topping.value === value)?.label ?? value;

export default function MultiComboboxExample() {
  // The text the user typed, which the list is filtered by. It empties
  // once an item is selected, and the list shows every item again.
  const [query, setQuery] = createSignal("");
  const shown = createMemo(() =>
    toppings.filter((topping) => includesText(topping.label, query())),
  );
  return (
    <div class="multi-combobox-field">
      <label
        class="multi-combobox-label"
        for="multi-combobox-toppings"
        id="multi-combobox-toppings-label"
      >
        Toppings
      </label>
      <MultiCombobox.Root
        name="toppings"
        defaultValue={["cheese"]}
        onInputValueChange={(text, { reason }) =>
          setQuery(reason === "input-change" ? text : "")
        }
      >
        <MultiCombobox.Chips class="multi-combobox-box">
          <MultiCombobox.Value>
            {(value) => (
              <MultiCombobox.Chip class="multi-combobox-chip" value={value}>
                {labelOf(value)}
                <MultiCombobox.ChipRemove
                  class="multi-combobox-chip-remove"
                  aria-label={`Remove ${labelOf(value)}`}
                >
                  ×
                </MultiCombobox.ChipRemove>
              </MultiCombobox.Chip>
            )}
          </MultiCombobox.Value>
          <MultiCombobox.Input
            class="multi-combobox-input"
            id="multi-combobox-toppings"
            placeholder="Add a topping"
          />
        </MultiCombobox.Chips>
        <MultiCombobox.Popup class="multi-combobox-popup" sideOffset={4}>
          <MultiCombobox.List aria-labelledby="multi-combobox-toppings-label">
            <For each={shown()}>
              {(topping) => (
                <MultiCombobox.Item
                  class="multi-combobox-item"
                  value={topping.value}
                >
                  <MultiCombobox.ItemIndicator class="multi-combobox-indicator">
                    ✓
                  </MultiCombobox.ItemIndicator>
                  {topping.label}
                </MultiCombobox.Item>
              )}
            </For>
          </MultiCombobox.List>
          <MultiCombobox.Status class="multi-combobox-status">
            {(count) => count === 0 && "No topping found"}
          </MultiCombobox.Status>
        </MultiCombobox.Popup>
      </MultiCombobox.Root>
    </div>
  );
}
