import { includesText, MultiCombobox } from "menhir/multi-combobox";
import { createMemo, createSignal, For } from "solid-js";

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
    <div class="flex flex-col gap-1.5 text-sm">
      <label
        for="multi-combobox-toppings-tailwind"
        id="multi-combobox-toppings-tailwind-label"
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
        <MultiCombobox.Chips class="box-border flex w-64 cursor-text flex-wrap items-center gap-1 rounded-md border border-stone-300 p-1 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-stone-500 dark:border-stone-600">
          <MultiCombobox.Value>
            {(value) => (
              <MultiCombobox.Chip
                value={value}
                class="inline-flex cursor-default items-center gap-0.5 rounded bg-stone-200 py-0.5 pr-0.5 pl-2 focus:outline-2 focus:outline-stone-500 dark:bg-stone-700"
              >
                {labelOf(value)}
                <MultiCombobox.ChipRemove
                  aria-label={`Remove ${labelOf(value)}`}
                  class="cursor-pointer border-0 bg-transparent px-1 text-inherit"
                >
                  ×
                </MultiCombobox.ChipRemove>
              </MultiCombobox.Chip>
            )}
          </MultiCombobox.Value>
          <MultiCombobox.Input
            id="multi-combobox-toppings-tailwind"
            placeholder="Add a topping"
            class="min-w-20 flex-1 border-0 bg-transparent px-1 py-0.5 text-inherit outline-none"
          />
        </MultiCombobox.Chips>
        <MultiCombobox.Popup
          sideOffset={4}
          class="m-0 box-border max-h-(--available-height) min-w-(--anchor-width) overflow-y-auto rounded-lg border border-stone-200 bg-white p-1 text-sm text-inherit shadow-lg transition-opacity duration-100 data-closed:opacity-0 dark:border-stone-700 dark:bg-stone-900 starting:data-open:opacity-0"
        >
          <MultiCombobox.List aria-labelledby="multi-combobox-toppings-tailwind-label">
            <For each={shown()}>
              {(topping) => (
                <MultiCombobox.Item
                  value={topping.value}
                  class="flex cursor-default items-center gap-2 rounded px-2 py-1.5 select-none data-active:bg-stone-100 dark:data-active:bg-stone-800"
                >
                  <MultiCombobox.ItemIndicator class="w-3 data-unselected:invisible">
                    ✓
                  </MultiCombobox.ItemIndicator>
                  {topping.label}
                </MultiCombobox.Item>
              )}
            </For>
          </MultiCombobox.List>
          <MultiCombobox.Status class="px-2 py-1.5 opacity-70 empty:hidden">
            {(count) => count === 0 && "No topping found"}
          </MultiCombobox.Status>
        </MultiCombobox.Popup>
      </MultiCombobox.Root>
    </div>
  );
}
