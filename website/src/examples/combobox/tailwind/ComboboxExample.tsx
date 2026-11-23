import { Combobox, includesText } from "menhir/combobox";
import { createMemo, createSignal, For } from "solid-js";

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

const button = "cursor-pointer border-0 bg-transparent px-2 text-inherit";

export default function ComboboxExample() {
  // The text the user typed, which the list is filtered by. A label the
  // Combobox puts in the input, after a selection, filters nothing.
  const [query, setQuery] = createSignal("");
  const shown = createMemo(() =>
    fruits.filter((fruit) => includesText(fruit.label, query())),
  );
  let field!: HTMLDivElement;
  return (
    <div class="flex flex-col gap-1.5 text-sm">
      <label for="combobox-fruit-tailwind" id="combobox-fruit-tailwind-label">
        Fruit
      </label>
      <Combobox.Root
        name="fruit"
        onInputValueChange={(text, { reason }) =>
          setQuery(reason === "input-change" ? text : "")
        }
      >
        <div
          ref={field}
          class="flex w-48 items-center rounded-md border border-stone-300 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-stone-500 dark:border-stone-600"
        >
          <Combobox.Input
            id="combobox-fruit-tailwind"
            placeholder="Pick a fruit"
            class="min-w-0 flex-1 border-0 bg-transparent px-3 py-1.5 text-inherit outline-none"
          />
          <Combobox.Clear class={button} aria-label="Clear">
            ×
          </Combobox.Clear>
          <Combobox.Trigger class={button} aria-label="Show fruits">
            ▾
          </Combobox.Trigger>
        </div>
        <Combobox.Popup
          anchor={() => field}
          sideOffset={4}
          class="m-0 box-border max-h-(--available-height) min-w-(--anchor-width) overflow-y-auto rounded-lg border border-stone-200 bg-white p-1 text-sm text-inherit shadow-lg transition-opacity duration-100 data-closed:opacity-0 dark:border-stone-700 dark:bg-stone-900 starting:data-open:opacity-0"
        >
          <Combobox.List aria-labelledby="combobox-fruit-tailwind-label">
            <For each={shown()}>
              {(fruit) => (
                <Combobox.Item
                  value={fruit.value}
                  class="flex cursor-default items-center gap-2 rounded px-2 py-1.5 select-none data-active:bg-stone-100 dark:data-active:bg-stone-800"
                >
                  <Combobox.ItemIndicator class="w-3 data-unselected:invisible">
                    ✓
                  </Combobox.ItemIndicator>
                  {fruit.label}
                </Combobox.Item>
              )}
            </For>
          </Combobox.List>
          <Combobox.Status class="px-2 py-1.5 opacity-70 empty:hidden">
            {(count) => count === 0 && "No fruit found"}
          </Combobox.Status>
        </Combobox.Popup>
      </Combobox.Root>
    </div>
  );
}
