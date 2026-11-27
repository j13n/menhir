import { Menu } from "@base-ui/react/menu";

export default function MenuDemo() {
  return (
    <Menu.Root>
      <Menu.Trigger>Actions</Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner className="positioner">
          <Menu.Popup className="popup">
            <Menu.Item className="item">New file</Menu.Item>
            <Menu.Item className="item" disabled>
              Open
            </Menu.Item>
            <Menu.Separator className="separator" />
            <Menu.CheckboxItem className="item">
              Word wrap
              <Menu.CheckboxItemIndicator className="check" />
            </Menu.CheckboxItem>
            <Menu.RadioGroup defaultValue="light">
              <Menu.GroupLabel className="group-label">Theme</Menu.GroupLabel>
              <Menu.RadioItem value="light" className="item">
                Light
                <Menu.RadioItemIndicator className="check" />
              </Menu.RadioItem>
              <Menu.RadioItem value="dark" className="item">
                Dark
                <Menu.RadioItemIndicator className="check" />
              </Menu.RadioItem>
            </Menu.RadioGroup>
            <Menu.SubmenuRoot>
              <Menu.SubmenuTrigger className="item submenu-trigger">
                Export
              </Menu.SubmenuTrigger>
              <Menu.Portal>
                <Menu.Positioner className="positioner">
                  <Menu.Popup className="popup">
                    <Menu.Item className="item">PDF</Menu.Item>
                    <Menu.Item className="item">PNG</Menu.Item>
                  </Menu.Popup>
                </Menu.Positioner>
              </Menu.Portal>
            </Menu.SubmenuRoot>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
