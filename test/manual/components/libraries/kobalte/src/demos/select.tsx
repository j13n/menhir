import { Select } from "@kobalte/core/select";

import { disabledFruit, fruits } from "../../../../shared/content.ts";

interface FruitGroup {
  label: string;
  options: string[];
}

const groups: FruitGroup[] = [
  { label: "Citrus", options: ["Lemon", "Lime"] },
  { label: "Berries", options: ["Raspberry", "Blueberry"] },
];

export default function SelectDemo() {
  return (
    <>
      <Select
        class="stack"
        options={fruits}
        optionDisabled={(fruit) => fruit === disabledFruit}
        placeholder="Pick a fruit"
        itemComponent={(props) => (
          <Select.Item item={props.item} class="item">
            <Select.ItemLabel>{props.item.rawValue}</Select.ItemLabel>
            <Select.ItemIndicator>✓</Select.ItemIndicator>
          </Select.Item>
        )}
      >
        <Select.Label>Fruit</Select.Label>
        <Select.Trigger class="row">
          <Select.Value<string>>
            {(state) => state.selectedOption()}
          </Select.Value>
          <Select.Icon />
        </Select.Trigger>
        <Select.Portal>
          <Select.Content class="popup same-width">
            <Select.Listbox />
          </Select.Content>
        </Select.Portal>
      </Select>

      <h2>Grouped</h2>
      <Select<string, FruitGroup>
        class="stack"
        options={groups}
        optionGroupChildren="options"
        placeholder="Pick a fruit"
        itemComponent={(props) => (
          <Select.Item item={props.item} class="item">
            <Select.ItemLabel>{props.item.rawValue}</Select.ItemLabel>
            <Select.ItemIndicator>✓</Select.ItemIndicator>
          </Select.Item>
        )}
        sectionComponent={(props) => (
          <Select.Section class="group-label">
            {props.section.rawValue.label}
          </Select.Section>
        )}
      >
        <Select.Label>Fruit</Select.Label>
        <Select.Trigger class="row">
          <Select.Value<string>>
            {(state) => state.selectedOption()}
          </Select.Value>
          <Select.Icon />
        </Select.Trigger>
        <Select.Portal>
          <Select.Content class="popup same-width">
            <Select.Listbox />
          </Select.Content>
        </Select.Portal>
      </Select>

      <h2>Multiple</h2>
      <Select<string>
        class="stack"
        multiple
        options={fruits}
        optionDisabled={(fruit) => fruit === disabledFruit}
        placeholder="Pick a fruit"
        itemComponent={(props) => (
          <Select.Item item={props.item} class="item">
            <Select.ItemLabel>{props.item.rawValue}</Select.ItemLabel>
            <Select.ItemIndicator>✓</Select.ItemIndicator>
          </Select.Item>
        )}
      >
        <Select.Label>Fruit</Select.Label>
        <Select.Trigger class="row">
          <Select.Value<string>>
            {(state) => state.selectedOptions().join(", ")}
          </Select.Value>
          <Select.Icon />
        </Select.Trigger>
        <Select.Portal>
          <Select.Content class="popup same-width">
            <Select.Listbox />
          </Select.Content>
        </Select.Portal>
      </Select>
    </>
  );
}
