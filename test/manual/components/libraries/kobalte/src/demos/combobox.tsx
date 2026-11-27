import { Combobox } from "@kobalte/core/combobox";

import { disabledFruit, fruits } from "../../../../shared/content.ts";

export default function ComboboxDemo() {
  return (
    <Combobox
      class="stack"
      options={fruits}
      optionDisabled={(fruit) => fruit === disabledFruit}
      placeholder="Pick a fruit"
      itemComponent={(props) => (
        <Combobox.Item item={props.item} class="item">
          <Combobox.ItemLabel>{props.item.rawValue}</Combobox.ItemLabel>
          <Combobox.ItemIndicator>✓</Combobox.ItemIndicator>
        </Combobox.Item>
      )}
    >
      <Combobox.Label>Fruit</Combobox.Label>
      <Combobox.Control class="row">
        <Combobox.Input />
        <Combobox.Trigger>
          <Combobox.Icon />
        </Combobox.Trigger>
      </Combobox.Control>
      <Combobox.Portal>
        <Combobox.Content class="popup same-width">
          <Combobox.Listbox />
        </Combobox.Content>
      </Combobox.Portal>
    </Combobox>
  );
}
