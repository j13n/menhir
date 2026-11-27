import { Autocomplete } from "@base-ui/react/autocomplete";

import { fruits } from "../../../../shared/content.ts";

export default function AutocompleteDemo() {
  return (
    <Autocomplete.Root items={fruits}>
      <label className="stack">
        Search fruit
        <Autocomplete.Input />
      </label>
      <Autocomplete.Portal>
        <Autocomplete.Positioner className="positioner hide-empty">
          <Autocomplete.Popup className="popup anchor-width">
            <Autocomplete.List>
              {(fruit: string) => (
                <Autocomplete.Item key={fruit} value={fruit} className="item">
                  {fruit}
                </Autocomplete.Item>
              )}
            </Autocomplete.List>
          </Autocomplete.Popup>
        </Autocomplete.Positioner>
      </Autocomplete.Portal>
    </Autocomplete.Root>
  );
}
