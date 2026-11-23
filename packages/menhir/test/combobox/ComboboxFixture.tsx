// Rendered on the server and hydrated in the test, so both sides get the
// same tree: a Combobox with a value and its label as defaultInputValue,
// one with a value and no defaultInputValue, whose label the server cannot
// know, and one open by default, which the server renders closed (README,
// "Decisions").
import { Combobox } from "../../src/combobox/index.ts";

export default function ComboboxFixture() {
  return (
    <>
      <label for="fruit" id="fruit-label">
        Fruit
      </label>
      <Combobox.Root
        name="fruit"
        defaultValue="banana"
        defaultInputValue="Banana"
      >
        <Combobox.Input id="fruit" />
        <Combobox.Trigger aria-label="Show fruits">▾</Combobox.Trigger>
        <Combobox.Popup data-testid="fruit-popup">
          <Combobox.List aria-labelledby="fruit-label" data-testid="fruit-list">
            <Combobox.Item value="apple">Apple</Combobox.Item>
            <Combobox.Item value="banana">
              <Combobox.ItemIndicator>✓</Combobox.ItemIndicator>
              Banana
            </Combobox.Item>
            <Combobox.Group>
              <Combobox.GroupLabel>Citrus</Combobox.GroupLabel>
              <Combobox.Item value="lemon">Lemon</Combobox.Item>
            </Combobox.Group>
          </Combobox.List>
          <Combobox.Status data-testid="fruit-status">
            {(count) => `${count} fruits`}
          </Combobox.Status>
        </Combobox.Popup>
      </Combobox.Root>
      <Combobox.Root defaultValue="m">
        <Combobox.Input aria-label="Size" />
        <Combobox.Popup>
          <Combobox.List aria-label="Sizes">
            <Combobox.Item value="s">Small</Combobox.Item>
            <Combobox.Item value="m">Medium</Combobox.Item>
          </Combobox.List>
        </Combobox.Popup>
      </Combobox.Root>
      <Combobox.Root defaultOpen>
        <Combobox.Input aria-label="Colour" />
        <Combobox.Popup data-testid="colour-popup">
          <Combobox.List aria-label="Colours">
            <Combobox.Item value="red">Red</Combobox.Item>
          </Combobox.List>
        </Combobox.Popup>
      </Combobox.Root>
    </>
  );
}
