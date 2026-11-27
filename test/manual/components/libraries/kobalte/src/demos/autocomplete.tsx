import { Search } from "@kobalte/core/search";
import { createSignal } from "solid-js";

import { fruits } from "../../../../shared/content.ts";

// Search leaves the filtering to its user: it only reports what was typed.
function matching(query: string) {
  const q = query.trim().toLowerCase();
  return q ? fruits.filter((fruit) => fruit.toLowerCase().includes(q)) : [];
}

export default function AutocompleteDemo() {
  const [options, setOptions] = createSignal<string[]>([]);

  return (
    <Search
      class="stack"
      options={options()}
      onInputChange={(query) => setOptions(matching(query))}
      itemComponent={(props) => (
        <Search.Item item={props.item} class="item">
          <Search.ItemLabel>{props.item.rawValue}</Search.ItemLabel>
        </Search.Item>
      )}
    >
      <Search.Label>Search fruit</Search.Label>
      <Search.Control>
        <Search.Input />
      </Search.Control>
      <Search.Portal>
        <Search.Content class="popup same-width">
          <Search.Listbox />
          <Search.NoResult class="item">No fruit found</Search.NoResult>
        </Search.Content>
      </Search.Portal>
    </Search>
  );
}
