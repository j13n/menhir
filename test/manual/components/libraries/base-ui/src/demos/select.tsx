import { Select } from "@base-ui/react/select";

import { disabledFruit, fruits } from "../../../../shared/content.ts";

const groups = [
  { label: "Citrus", items: ["Lemon", "Lime"] },
  { label: "Berries", items: ["Raspberry", "Blueberry"] },
];

function Trigger() {
  return (
    <Select.Trigger>
      <Select.Value placeholder="Pick a fruit" /> <Select.Icon />
    </Select.Trigger>
  );
}

function Item(props: { value: string; disabled?: boolean }) {
  return (
    <Select.Item value={props.value} disabled={props.disabled} className="item">
      <Select.ItemText>{props.value}</Select.ItemText>
      <Select.ItemIndicator className="check" />
    </Select.Item>
  );
}

export default function SelectDemo() {
  return (
    <>
      <div className="stack">
        <Select.Root>
          <Select.Label>Fruit</Select.Label>
          <Trigger />
          <Select.Portal>
            <Select.Positioner className="positioner">
              <Select.Popup className="popup">
                <Select.List>
                  {fruits.map((fruit) => (
                    <Item
                      key={fruit}
                      value={fruit}
                      disabled={fruit === disabledFruit}
                    />
                  ))}
                </Select.List>
              </Select.Popup>
            </Select.Positioner>
          </Select.Portal>
        </Select.Root>
      </div>

      <h2>Grouped</h2>
      <div className="stack">
        <Select.Root>
          <Select.Label>Fruit</Select.Label>
          <Trigger />
          <Select.Portal>
            <Select.Positioner className="positioner">
              <Select.Popup className="popup">
                <Select.List>
                  {groups.map((group) => (
                    <Select.Group key={group.label}>
                      <Select.GroupLabel className="group-label">
                        {group.label}
                      </Select.GroupLabel>
                      {group.items.map((fruit) => (
                        <Item key={fruit} value={fruit} />
                      ))}
                    </Select.Group>
                  ))}
                </Select.List>
              </Select.Popup>
            </Select.Positioner>
          </Select.Portal>
        </Select.Root>
      </div>

      <h2>Multiple</h2>
      <div className="stack">
        <Select.Root multiple>
          <Select.Label>Fruit</Select.Label>
          <Trigger />
          <Select.Portal>
            <Select.Positioner className="positioner">
              <Select.Popup className="popup">
                <Select.List>
                  {fruits.map((fruit) => (
                    <Item
                      key={fruit}
                      value={fruit}
                      disabled={fruit === disabledFruit}
                    />
                  ))}
                </Select.List>
              </Select.Popup>
            </Select.Positioner>
          </Select.Portal>
        </Select.Root>
      </div>
    </>
  );
}
