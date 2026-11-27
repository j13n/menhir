import { DropdownMenu } from "@kobalte/core/dropdown-menu";

export default function MenuDemo() {
  return (
    <DropdownMenu>
      <DropdownMenu.Trigger>Actions</DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content class="popup">
          <DropdownMenu.Item class="item">New file</DropdownMenu.Item>
          <DropdownMenu.Item class="item" disabled>
            Open
          </DropdownMenu.Item>
          <DropdownMenu.Separator class="separator" />
          <DropdownMenu.CheckboxItem class="item">
            <DropdownMenu.ItemIndicator>✓</DropdownMenu.ItemIndicator>
            Word wrap
          </DropdownMenu.CheckboxItem>
          <DropdownMenu.Group>
            <DropdownMenu.GroupLabel class="group-label">
              Theme
            </DropdownMenu.GroupLabel>
            <DropdownMenu.RadioGroup defaultValue="light">
              <DropdownMenu.RadioItem class="item" value="light">
                <DropdownMenu.ItemIndicator>●</DropdownMenu.ItemIndicator>
                Light
              </DropdownMenu.RadioItem>
              <DropdownMenu.RadioItem class="item" value="dark">
                <DropdownMenu.ItemIndicator>●</DropdownMenu.ItemIndicator>
                Dark
              </DropdownMenu.RadioItem>
            </DropdownMenu.RadioGroup>
          </DropdownMenu.Group>
          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger class="item">
              Export
            </DropdownMenu.SubTrigger>
            <DropdownMenu.Portal>
              <DropdownMenu.SubContent class="popup">
                <DropdownMenu.Item class="item">PDF</DropdownMenu.Item>
                <DropdownMenu.Item class="item">PNG</DropdownMenu.Item>
              </DropdownMenu.SubContent>
            </DropdownMenu.Portal>
          </DropdownMenu.Sub>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu>
  );
}
