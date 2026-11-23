import { Autocomplete, includesText } from "menhir/autocomplete";
import { createMemo, createSignal, For } from "solid-js";

const cities = [
  "Amsterdam",
  "Athens",
  "Berlin",
  "Lisbon",
  "London",
  "Madrid",
  "Oslo",
  "Paris",
  "Rome",
  "Vienna",
];

export default function AutocompleteExample() {
  // The text the user typed, which the suggestions are filtered by. A
  // suggestion the user accepted filters nothing.
  const [query, setQuery] = createSignal("");
  const shown = createMemo(() =>
    cities.filter((city) => includesText(city, query())),
  );
  let field!: HTMLDivElement;
  return (
    <div class="flex flex-col gap-1.5 text-sm">
      <label
        for="autocomplete-city-tailwind"
        id="autocomplete-city-tailwind-label"
      >
        City
      </label>
      <Autocomplete.Root
        name="city"
        onValueChange={(text, { reason }) =>
          setQuery(reason === "input-change" ? text : "")
        }
      >
        <div
          ref={field}
          class="flex w-48 items-center rounded-md border border-stone-300 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-stone-500 dark:border-stone-600"
        >
          <Autocomplete.Input
            id="autocomplete-city-tailwind"
            placeholder="Any city"
            class="min-w-0 flex-1 border-0 bg-transparent px-3 py-1.5 text-inherit outline-none"
          />
          <Autocomplete.Clear
            class="cursor-pointer border-0 bg-transparent px-2 text-inherit"
            aria-label="Clear"
          >
            ×
          </Autocomplete.Clear>
        </div>
        <Autocomplete.Popup
          anchor={() => field}
          sideOffset={4}
          class="m-0 box-border max-h-(--available-height) min-w-(--anchor-width) overflow-y-auto rounded-lg border border-stone-200 bg-white p-1 text-sm text-inherit shadow-lg transition-opacity duration-100 data-closed:opacity-0 dark:border-stone-700 dark:bg-stone-900 starting:data-open:opacity-0"
        >
          <Autocomplete.List aria-labelledby="autocomplete-city-tailwind-label">
            <For each={shown()}>
              {(city) => (
                <Autocomplete.Item
                  value={city}
                  class="cursor-default rounded px-2 py-1.5 select-none data-active:bg-stone-100 dark:data-active:bg-stone-800"
                >
                  {city}
                </Autocomplete.Item>
              )}
            </For>
          </Autocomplete.List>
          <Autocomplete.Status class="px-2 py-1.5 opacity-70 empty:hidden">
            {(count) => count === 0 && "No suggestions"}
          </Autocomplete.Status>
        </Autocomplete.Popup>
      </Autocomplete.Root>
    </div>
  );
}
