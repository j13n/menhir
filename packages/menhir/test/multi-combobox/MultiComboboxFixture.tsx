// Rendered on the server and hydrated in the test, so both sides get the
// same tree: a Multi Combobox with two values and a typed text, and one
// open by default, which the server renders closed (README, "Decisions").
import { MultiCombobox } from "../../src/multi-combobox/index.ts";

const labels: Record<string, string> = {
  cheese: "Cheese",
  olives: "Olives",
  onions: "Onions",
};

export default function MultiComboboxFixture() {
  return (
    <>
      <label for="toppings" id="toppings-label">
        Toppings
      </label>
      <MultiCombobox.Root
        name="toppings"
        defaultValue={["olives", "cheese"]}
        defaultInputValue="on"
      >
        <MultiCombobox.Chips data-testid="chips">
          <MultiCombobox.Value>
            {(value) => (
              <MultiCombobox.Chip value={value}>
                {labels[value]}
                <MultiCombobox.ChipRemove
                  aria-label={`Remove ${labels[value]}`}
                >
                  ×
                </MultiCombobox.ChipRemove>
              </MultiCombobox.Chip>
            )}
          </MultiCombobox.Value>
          <MultiCombobox.Input id="toppings" />
        </MultiCombobox.Chips>
        <MultiCombobox.Trigger aria-label="Show toppings">
          ▾
        </MultiCombobox.Trigger>
        <MultiCombobox.Popup data-testid="toppings-popup">
          <MultiCombobox.List
            aria-labelledby="toppings-label"
            data-testid="toppings-list"
          >
            <MultiCombobox.Item value="cheese">
              <MultiCombobox.ItemIndicator>✓</MultiCombobox.ItemIndicator>
              Cheese
            </MultiCombobox.Item>
            <MultiCombobox.Item value="olives">Olives</MultiCombobox.Item>
            <MultiCombobox.Item value="onions">Onions</MultiCombobox.Item>
          </MultiCombobox.List>
        </MultiCombobox.Popup>
      </MultiCombobox.Root>
      <MultiCombobox.Root defaultOpen>
        <MultiCombobox.Input aria-label="Colours" />
        <MultiCombobox.Popup data-testid="colour-popup">
          <MultiCombobox.List aria-label="Colours">
            <MultiCombobox.Item value="red">Red</MultiCombobox.Item>
          </MultiCombobox.List>
        </MultiCombobox.Popup>
      </MultiCombobox.Root>
    </>
  );
}
