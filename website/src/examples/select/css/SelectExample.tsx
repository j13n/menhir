import { Select } from "menhir/select";

import "./select.css";

export default function SelectExample() {
  return (
    <div class="select-field">
      <label class="select-label" for="select-fruit">
        Fruit
      </label>
      <Select.Root name="fruit" defaultValue="apple">
        <Select.Trigger class="select-trigger" id="select-fruit">
          <Select.Value placeholder="Pick a fruit" />
        </Select.Trigger>
        <Select.Popup class="select-popup" sideOffset={4}>
          <Select.Item class="select-item" value="apple">
            <Select.ItemIndicator class="select-indicator">
              ✓
            </Select.ItemIndicator>
            Apple
          </Select.Item>
          <Select.Item class="select-item" value="banana">
            <Select.ItemIndicator class="select-indicator">
              ✓
            </Select.ItemIndicator>
            Banana
          </Select.Item>
          <Select.Item class="select-item" value="cherry" disabled>
            <Select.ItemIndicator class="select-indicator">
              ✓
            </Select.ItemIndicator>
            Cherry
          </Select.Item>
          <Select.Group>
            <Select.GroupLabel class="select-group-label">
              Citrus
            </Select.GroupLabel>
            <Select.Item class="select-item" value="lemon">
              <Select.ItemIndicator class="select-indicator">
                ✓
              </Select.ItemIndicator>
              Lemon
            </Select.Item>
            <Select.Item class="select-item" value="orange">
              <Select.ItemIndicator class="select-indicator">
                ✓
              </Select.ItemIndicator>
              Orange
            </Select.Item>
          </Select.Group>
        </Select.Popup>
      </Select.Root>
    </div>
  );
}
