import { Autocomplete } from "menhir/autocomplete";
import { Combobox, includesText } from "menhir/combobox";
import { MultiCombobox } from "menhir/multi-combobox";
import { Select } from "menhir/select";
import { createMemo, createSignal, For } from "solid-js";

import { ExampleCard, ExampleGroup } from "./ExampleGroup";

const cities = ["Lisbon", "London", "Madrid", "Oslo", "Paris", "Rome"];
const searches = ["menhir", "megalith", "monolith", "standing stone"];
const stones = ["Basalt", "Granite", "Limestone", "Sandstone"];
/** A stone's label, from its value. */
const stoneLabel = (value: string) =>
  stones.find((stone) => stone.toLowerCase() === value);

export default function PickerExamples() {
  // The Combobox's list, filtered by what the user typed.
  const [cityQuery, setCityQuery] = createSignal("");
  const shownCities = createMemo(() =>
    cities.filter((city) => includesText(city, cityQuery())),
  );
  // The Autocomplete's suggestions, filtered the same way.
  const [searchQuery, setSearchQuery] = createSignal("");
  const shownSearches = createMemo(() =>
    searches.filter((term) => includesText(term, searchQuery())),
  );
  // The Multi Combobox's list, filtered the same way.
  const [stoneQuery, setStoneQuery] = createSignal("");
  const shownStones = createMemo(() =>
    stones.filter((stone) => includesText(stone, stoneQuery())),
  );
  return (
    <ExampleGroup category="Pickers">
      <ExampleCard name="Select" href="/docs/components/select">
        <div class="flex items-center justify-between gap-4">
          <label for="home-select">Paper</label>
          <Select.Root name="paper" defaultValue="a4">
            <Select.Trigger
              id="home-select"
              class="flex min-w-28 cursor-pointer items-center justify-between gap-2 rounded-md border border-stone-300 px-3 py-1 text-sm after:content-['▾'] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500 dark:border-stone-700"
            >
              <Select.Value />
            </Select.Trigger>
            <Select.Popup
              class="m-0 max-h-(--available-height) min-w-(--anchor-width) overflow-y-auto rounded-lg border border-stone-200 bg-white p-1 text-sm text-inherit shadow-lg transition-opacity duration-100 data-closed:opacity-0 dark:border-stone-800 dark:bg-stone-900 starting:data-open:opacity-0"
              sideOffset={4}
            >
              <Select.Item
                value="a4"
                class="flex cursor-default items-center gap-2 rounded px-2 py-1.5 select-none data-active:bg-stone-100 dark:data-active:bg-stone-800"
              >
                <Select.ItemIndicator class="w-3 data-unselected:invisible">
                  ✓
                </Select.ItemIndicator>
                A4
              </Select.Item>
              <Select.Item
                value="a5"
                class="flex cursor-default items-center gap-2 rounded px-2 py-1.5 select-none data-active:bg-stone-100 dark:data-active:bg-stone-800"
              >
                <Select.ItemIndicator class="w-3 data-unselected:invisible">
                  ✓
                </Select.ItemIndicator>
                A5
              </Select.Item>
              <Select.Item
                value="letter"
                class="flex cursor-default items-center gap-2 rounded px-2 py-1.5 select-none data-active:bg-stone-100 dark:data-active:bg-stone-800"
              >
                <Select.ItemIndicator class="w-3 data-unselected:invisible">
                  ✓
                </Select.ItemIndicator>
                Letter
              </Select.Item>
            </Select.Popup>
          </Select.Root>
        </div>
      </ExampleCard>
      <ExampleCard name="Combobox" href="/docs/components/combobox">
        <div class="flex items-center justify-between gap-4">
          <label for="home-combobox" id="home-combobox-label">
            City
          </label>
          <Combobox.Root
            name="city"
            onInputValueChange={(text, { reason }) =>
              setCityQuery(reason === "input-change" ? text : "")
            }
          >
            <Combobox.Input
              id="home-combobox"
              class="w-28 rounded-md border border-stone-300 bg-transparent px-3 py-1 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500 dark:border-stone-700"
            />
            <Combobox.Popup
              class="m-0 max-h-(--available-height) min-w-(--anchor-width) overflow-y-auto rounded-lg border border-stone-200 bg-white p-1 text-sm text-inherit shadow-lg transition-opacity duration-100 data-closed:opacity-0 dark:border-stone-800 dark:bg-stone-900 starting:data-open:opacity-0"
              sideOffset={4}
            >
              <Combobox.List aria-labelledby="home-combobox-label">
                <For each={shownCities()}>
                  {(city) => (
                    <Combobox.Item
                      value={city.toLowerCase()}
                      class="cursor-default rounded px-2 py-1.5 select-none data-active:bg-stone-100 dark:data-active:bg-stone-800"
                    >
                      {city}
                    </Combobox.Item>
                  )}
                </For>
              </Combobox.List>
              <Combobox.Status class="px-2 py-1.5 opacity-70 empty:hidden">
                {(count) => count === 0 && "No city found"}
              </Combobox.Status>
            </Combobox.Popup>
          </Combobox.Root>
        </div>
      </ExampleCard>
      <ExampleCard name="Multi Combobox" href="/docs/components/multi-combobox">
        <div class="flex items-center justify-between gap-4">
          <label for="home-multi-combobox" id="home-multi-combobox-label">
            Stones
          </label>
          <MultiCombobox.Root
            name="stones"
            defaultValue={["granite"]}
            onInputValueChange={(text, { reason }) =>
              setStoneQuery(reason === "input-change" ? text : "")
            }
          >
            <MultiCombobox.Chips class="flex w-44 cursor-text flex-wrap items-center gap-1 rounded-md border border-stone-300 p-0.5 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-stone-500 dark:border-stone-700">
              <MultiCombobox.Value>
                {(value) => (
                  <MultiCombobox.Chip
                    value={value}
                    class="inline-flex items-center rounded bg-stone-200 pl-1.5 text-xs focus:outline-2 focus:outline-stone-500 dark:bg-stone-700"
                  >
                    {stoneLabel(value)}
                    <MultiCombobox.ChipRemove
                      aria-label={`Remove ${stoneLabel(value)}`}
                      class="cursor-pointer border-0 bg-transparent px-1 text-inherit"
                    >
                      ×
                    </MultiCombobox.ChipRemove>
                  </MultiCombobox.Chip>
                )}
              </MultiCombobox.Value>
              <MultiCombobox.Input
                id="home-multi-combobox"
                class="w-12 min-w-0 flex-1 border-0 bg-transparent px-1 py-0.5 text-sm outline-none"
              />
            </MultiCombobox.Chips>
            <MultiCombobox.Popup
              class="m-0 max-h-(--available-height) min-w-(--anchor-width) overflow-y-auto rounded-lg border border-stone-200 bg-white p-1 text-sm text-inherit shadow-lg transition-opacity duration-100 data-closed:opacity-0 dark:border-stone-800 dark:bg-stone-900 starting:data-open:opacity-0"
              sideOffset={4}
            >
              <MultiCombobox.List aria-labelledby="home-multi-combobox-label">
                <For each={shownStones()}>
                  {(stone) => (
                    <MultiCombobox.Item
                      value={stone.toLowerCase()}
                      class="flex cursor-default items-center gap-2 rounded px-2 py-1.5 select-none data-active:bg-stone-100 dark:data-active:bg-stone-800"
                    >
                      <MultiCombobox.ItemIndicator class="w-3 data-unselected:invisible">
                        ✓
                      </MultiCombobox.ItemIndicator>
                      {stone}
                    </MultiCombobox.Item>
                  )}
                </For>
              </MultiCombobox.List>
            </MultiCombobox.Popup>
          </MultiCombobox.Root>
        </div>
      </ExampleCard>
      <ExampleCard name="Autocomplete" href="/docs/components/autocomplete">
        <div class="flex items-center justify-between gap-4">
          <label for="home-autocomplete" id="home-autocomplete-label">
            Search
          </label>
          <Autocomplete.Root
            name="search"
            onValueChange={(text, { reason }) =>
              setSearchQuery(reason === "input-change" ? text : "")
            }
          >
            <Autocomplete.Input
              id="home-autocomplete"
              class="w-28 rounded-md border border-stone-300 bg-transparent px-3 py-1 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500 dark:border-stone-700"
            />
            <Autocomplete.Popup
              class="m-0 max-h-(--available-height) min-w-(--anchor-width) overflow-y-auto rounded-lg border border-stone-200 bg-white p-1 text-sm text-inherit shadow-lg transition-opacity duration-100 data-closed:opacity-0 dark:border-stone-800 dark:bg-stone-900 starting:data-open:opacity-0"
              sideOffset={4}
            >
              <Autocomplete.List aria-labelledby="home-autocomplete-label">
                <For each={shownSearches()}>
                  {(term) => (
                    <Autocomplete.Item
                      value={term}
                      class="cursor-default rounded px-2 py-1.5 select-none data-active:bg-stone-100 dark:data-active:bg-stone-800"
                    >
                      {term}
                    </Autocomplete.Item>
                  )}
                </For>
              </Autocomplete.List>
            </Autocomplete.Popup>
          </Autocomplete.Root>
        </div>
      </ExampleCard>
    </ExampleGroup>
  );
}
