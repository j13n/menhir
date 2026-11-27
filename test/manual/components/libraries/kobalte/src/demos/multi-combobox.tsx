import { Combobox } from "@kobalte/core/combobox";
import { For } from "solid-js";

import { fruits } from "../../../../shared/content.ts";

export default function MultiComboboxDemo() {
  return (
    <Combobox<string>
      class="stack"
      multiple
      options={fruits}
      itemComponent={(props) => (
        <Combobox.Item item={props.item} class="item">
          <Combobox.ItemLabel>{props.item.rawValue}</Combobox.ItemLabel>
          <Combobox.ItemIndicator>✓</Combobox.ItemIndicator>
        </Combobox.Item>
      )}
    >
      <Combobox.Label>Fruits</Combobox.Label>
      <Combobox.Control<string> class="row">
        {(state) => (
          <>
            <For each={state.selectedOptions()}>
              {(fruit) => (
                <span
                  class="chip"
                  onPointerDown={(event) => event.stopPropagation()}
                >
                  {fruit}
                  <button onClick={() => state.remove(fruit)}>
                    Remove {fruit}
                  </button>
                </span>
              )}
            </For>
            <Combobox.Input />
            <Combobox.Trigger>
              <Combobox.Icon />
            </Combobox.Trigger>
          </>
        )}
      </Combobox.Control>
      <Combobox.Portal>
        <Combobox.Content class="popup same-width">
          <Combobox.Listbox />
        </Combobox.Content>
      </Combobox.Portal>
    </Combobox>
  );
}
