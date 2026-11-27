import { Menu } from "@base-ui/react/menu";
import { Menubar } from "@base-ui/react/menubar";

export default function MenubarDemo() {
  return (
    <Menubar className="row">
      <Menu.Root>
        <Menu.Trigger>File</Menu.Trigger>
        <Menu.Portal>
          <Menu.Positioner className="positioner">
            <Menu.Popup className="popup">
              <Menu.Item className="item">New</Menu.Item>
              <Menu.Item className="item">Open</Menu.Item>
              <Menu.Item className="item">Save</Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>

      <Menu.Root>
        <Menu.Trigger>Edit</Menu.Trigger>
        <Menu.Portal>
          <Menu.Positioner className="positioner">
            <Menu.Popup className="popup">
              <Menu.Item className="item">Undo</Menu.Item>
              <Menu.Item className="item" disabled>
                Redo
              </Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>

      <Menu.Root>
        <Menu.Trigger>View</Menu.Trigger>
        <Menu.Portal>
          <Menu.Positioner className="positioner">
            <Menu.Popup className="popup">
              <Menu.CheckboxItem className="item">
                Sidebar
                <Menu.CheckboxItemIndicator className="check" />
              </Menu.CheckboxItem>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>
    </Menubar>
  );
}
