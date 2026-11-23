import { Autocomplete, includesText } from "menhir/autocomplete";
import { createMemo, createSignal, For } from "solid-js";

import "./autocomplete.css";

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
    <div class="autocomplete-field">
      <label
        class="autocomplete-label"
        for="autocomplete-city"
        id="autocomplete-city-label"
      >
        City
      </label>
      <Autocomplete.Root
        name="city"
        onValueChange={(text, { reason }) =>
          setQuery(reason === "input-change" ? text : "")
        }
      >
        <div class="autocomplete-box" ref={field}>
          <Autocomplete.Input
            class="autocomplete-input"
            id="autocomplete-city"
            placeholder="Any city"
          />
          <Autocomplete.Clear class="autocomplete-button" aria-label="Clear">
            ×
          </Autocomplete.Clear>
        </div>
        <Autocomplete.Popup
          class="autocomplete-popup"
          anchor={() => field}
          sideOffset={4}
        >
          <Autocomplete.List aria-labelledby="autocomplete-city-label">
            <For each={shown()}>
              {(city) => (
                <Autocomplete.Item class="autocomplete-item" value={city}>
                  {city}
                </Autocomplete.Item>
              )}
            </For>
          </Autocomplete.List>
          <Autocomplete.Status class="autocomplete-status">
            {(count) => count === 0 && "No suggestions"}
          </Autocomplete.Status>
        </Autocomplete.Popup>
      </Autocomplete.Root>
    </div>
  );
}
