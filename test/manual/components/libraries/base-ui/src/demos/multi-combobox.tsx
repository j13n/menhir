import { useId } from "react";

import { Combobox } from "@base-ui/react/combobox";

import { fruits } from "../../../../shared/content.ts";

export default function MultiComboboxDemo() {
  // <Combobox.Label> names a trigger button only; an input takes a <label>.
  const id = useId();

  return (
    <Combobox.Root items={fruits} multiple>
      <div className="stack">
        <label htmlFor={id}>Fruits</label>
        <Combobox.InputGroup>
          <Combobox.Value>
            {(value: string[]) => (
              <Combobox.Chips className="chips">
                {value.map((fruit) => (
                  <Combobox.Chip key={fruit} className="chip">
                    {fruit}
                    {/* A button with only a cross in it needs a name; the
                        docs give it this one. */}
                    <Combobox.ChipRemove aria-label={`Remove ${fruit}`}>
                      ×
                    </Combobox.ChipRemove>
                  </Combobox.Chip>
                ))}
                <Combobox.Input id={id} />
              </Combobox.Chips>
            )}
          </Combobox.Value>
        </Combobox.InputGroup>
      </div>
      <Combobox.Portal>
        <Combobox.Positioner className="positioner">
          <Combobox.Popup className="popup anchor-width">
            <Combobox.Empty>
              <div className="item">No fruit found</div>
            </Combobox.Empty>
            <Combobox.List>
              {(fruit: string) => (
                <Combobox.Item key={fruit} value={fruit} className="item">
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
