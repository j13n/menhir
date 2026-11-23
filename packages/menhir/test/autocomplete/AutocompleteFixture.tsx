// Rendered on the server and hydrated in the test, so both sides get the
// same tree: an Autocomplete with a text, and one open by default, which
// the server renders closed (README, "Decisions").
import { Autocomplete } from "../../src/autocomplete/index.ts";

export default function AutocompleteFixture() {
  return (
    <>
      <label for="city" id="city-label">
        City
      </label>
      <Autocomplete.Root name="city" defaultValue="Os">
        <Autocomplete.Input id="city" />
        <Autocomplete.Trigger aria-label="Show cities">▾</Autocomplete.Trigger>
        <Autocomplete.Popup data-testid="city-popup">
          <Autocomplete.List
            aria-labelledby="city-label"
            data-testid="city-list"
          >
            <Autocomplete.Item value="Bergen">Bergen</Autocomplete.Item>
            <Autocomplete.Item value="Oslo">Oslo</Autocomplete.Item>
            <Autocomplete.Group>
              <Autocomplete.GroupLabel>North</Autocomplete.GroupLabel>
              <Autocomplete.Item value="Tromsø">Tromsø</Autocomplete.Item>
            </Autocomplete.Group>
          </Autocomplete.List>
          <Autocomplete.Status data-testid="city-status">
            {(count) => `${count} cities`}
          </Autocomplete.Status>
        </Autocomplete.Popup>
      </Autocomplete.Root>
      <Autocomplete.Root defaultOpen>
        <Autocomplete.Input aria-label="Colour" />
        <Autocomplete.Popup data-testid="colour-popup">
          <Autocomplete.List aria-label="Colours">
            <Autocomplete.Item value="Red">Red</Autocomplete.Item>
          </Autocomplete.List>
        </Autocomplete.Popup>
      </Autocomplete.Root>
    </>
  );
}
