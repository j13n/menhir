import { Label, Select } from "radix-ui";

import { disabledFruit, fruits } from "../../../../shared/content.ts";

function Option(props: { value: string; disabled?: boolean }) {
  return (
    <Select.Item
      className="item"
      value={props.value.toLowerCase()}
      disabled={props.disabled}
    >
      <Select.ItemText>{props.value}</Select.ItemText>
      <Select.ItemIndicator className="mark" />
    </Select.Item>
  );
}

// Radix's select holds one value; there is no "Multiple".
export default function SelectDemo() {
  return (
    <>
      <div className="stack">
        <Label.Root htmlFor="fruit">Fruit</Label.Root>
        <Select.Root>
          <Select.Trigger id="fruit">
            <Select.Value placeholder="Pick a fruit" />
            <Select.Icon />
          </Select.Trigger>
          <Select.Portal>
            <Select.Content className="popup">
              <Select.Viewport>
                {fruits.map((fruit) => (
                  <Option
                    key={fruit}
                    value={fruit}
                    disabled={fruit === disabledFruit}
                  />
                ))}
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>
      </div>

      <h2>Grouped</h2>
      <div className="stack">
        <Label.Root htmlFor="fruit-grouped">Fruit</Label.Root>
        <Select.Root>
          <Select.Trigger id="fruit-grouped">
            <Select.Value placeholder="Pick a fruit" />
            <Select.Icon />
          </Select.Trigger>
          <Select.Portal>
            <Select.Content className="popup">
              <Select.Viewport>
                <Select.Group>
                  <Select.Label className="group-label">Citrus</Select.Label>
                  <Option value="Lemon" />
                  <Option value="Lime" />
                </Select.Group>
                <Select.Group>
                  <Select.Label className="group-label">Berries</Select.Label>
                  <Option value="Raspberry" />
                  <Option value="Blueberry" />
                </Select.Group>
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>
      </div>
    </>
  );
}
