// Rendered on the server and hydrated in the test, so both sides get the
// same tree: a closed Select with a value, one whose Value maps values to
// labels, and one open by default, which the server renders closed
// (README, "Decisions").
import { Select } from "../../src/select/index.ts";

const sizes: Record<string, string> = { s: "Small", m: "Medium" };

export default function SelectFixture() {
  return (
    <>
      <label for="fruit">Fruit</label>
      <Select.Root name="fruit" defaultValue="banana">
        <Select.Trigger id="fruit">
          <Select.Value data-testid="fruit-value" placeholder="Pick a fruit" />
        </Select.Trigger>
        <Select.Popup data-testid="fruit-list">
          <Select.Item value="apple">Apple</Select.Item>
          <Select.Item value="banana" label="Banana">
            <Select.ItemIndicator />
            🍌 Banana
          </Select.Item>
          <Select.Group>
            <Select.GroupLabel>Citrus</Select.GroupLabel>
            <Select.Item value="lemon">Lemon</Select.Item>
          </Select.Group>
        </Select.Popup>
      </Select.Root>
      <Select.Root defaultValue="m">
        <Select.Trigger aria-label="Size">
          <Select.Value data-testid="size-value">
            {(value) => sizes[value]}
          </Select.Value>
        </Select.Trigger>
        <Select.Popup data-testid="size-list">
          <Select.Item value="s">Small</Select.Item>
          <Select.Item value="m">Medium</Select.Item>
        </Select.Popup>
      </Select.Root>
      <Select.Root defaultOpen>
        <Select.Trigger aria-label="Colour">
          <Select.Value
            data-testid="colour-value"
            placeholder="Pick a colour"
          />
        </Select.Trigger>
        <Select.Popup data-testid="colour-list">
          <Select.Item value="red">Red</Select.Item>
        </Select.Popup>
      </Select.Root>
    </>
  );
}
