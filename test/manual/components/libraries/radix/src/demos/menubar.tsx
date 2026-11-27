import { Menubar } from "radix-ui";
import { useState } from "react";

export default function MenubarDemo() {
  const [sidebar, setSidebar] = useState(false);
  return (
    <Menubar.Root className="row">
      <Menubar.Menu>
        <Menubar.Trigger>File</Menubar.Trigger>
        <Menubar.Portal>
          <Menubar.Content className="popup">
            <Menubar.Item className="item">New</Menubar.Item>
            <Menubar.Item className="item">Open</Menubar.Item>
            <Menubar.Item className="item">Save</Menubar.Item>
          </Menubar.Content>
        </Menubar.Portal>
      </Menubar.Menu>
      <Menubar.Menu>
        <Menubar.Trigger>Edit</Menubar.Trigger>
        <Menubar.Portal>
          <Menubar.Content className="popup">
            <Menubar.Item className="item">Undo</Menubar.Item>
            <Menubar.Item className="item" disabled>
              Redo
            </Menubar.Item>
          </Menubar.Content>
        </Menubar.Portal>
      </Menubar.Menu>
      <Menubar.Menu>
        <Menubar.Trigger>View</Menubar.Trigger>
        <Menubar.Portal>
          <Menubar.Content className="popup">
            <Menubar.CheckboxItem
              className="item"
              checked={sidebar}
              onCheckedChange={setSidebar}
            >
              <Menubar.ItemIndicator className="mark" />
              Sidebar
            </Menubar.CheckboxItem>
          </Menubar.Content>
        </Menubar.Portal>
      </Menubar.Menu>
    </Menubar.Root>
  );
}
