import { useId } from "react";

import { Combobox } from "@base-ui/react/combobox";

import { disabledFruit, fruits } from "../../../../shared/content.ts";

export default function ComboboxDemo() {
  // <Combobox.Label> names a trigger button only; an input takes a <label>.
  const id = useId();

  return (
    <Combobox.Root items={fruits}>
      <div className="stack">
        <label htmlFor={id}>Fruit</label>
        <Combobox.Input id={id} placeholder="Pick a fruit" />
      </div>
      <Combobox.Portal>
        <Combobox.Positioner className="positioner">
          <Combobox.Popup className="popup anchor-width">
            <Combobox.Empty>
              <div className="item">No fruit found</div>
            </Combobox.Empty>
            <Combobox.List>
              {(fruit: string) => (
                <Combobox.Item
                  key={fruit}
                  value={fruit}
                  disabled={fruit === disabledFruit}
                  className="item"
                >
                  {fruit}
                  <Combobox.ItemIndicator className="check" />
                </Combobox.Item>
              )}
            </Combobox.List>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  );
}
