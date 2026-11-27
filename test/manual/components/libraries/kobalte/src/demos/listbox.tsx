import { Listbox } from "@kobalte/core/listbox";

import { disabledFruit, fruits } from "../../../../shared/content.ts";

// Listbox has no label part, so its name is plain text.
export default function ListboxDemo() {
  return (
    <div class="stack">
      <span>Fruit</span>
      <Listbox
        class="popup listbox"
        options={fruits}
        optionDisabled={(fruit) => fruit === disabledFruit}
        renderItem={(item) => (
          <Listbox.Item item={item} class="item">
            <Listbox.ItemLabel>{item.rawValue}</Listbox.ItemLabel>
            <Listbox.ItemIndicator>✓</Listbox.ItemIndicator>
          </Listbox.Item>
        )}
      />
    </div>
  );
}
