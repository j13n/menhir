import { Menubar } from "@kobalte/core/menubar";

export default function MenubarDemo() {
  return (
    <Menubar class="row">
      <Menubar.Menu>
        <Menubar.Trigger>File</Menubar.Trigger>
        <Menubar.Portal>
          <Menubar.Content class="popup">
            <Menubar.Item class="item">New</Menubar.Item>
            <Menubar.Item class="item">Open</Menubar.Item>
            <Menubar.Item class="item">Save</Menubar.Item>
          </Menubar.Content>
        </Menubar.Portal>
      </Menubar.Menu>
      <Menubar.Menu>
        <Menubar.Trigger>Edit</Menubar.Trigger>
        <Menubar.Portal>
          <Menubar.Content class="popup">
            <Menubar.Item class="item">Undo</Menubar.Item>
            <Menubar.Item class="item" disabled>
              Redo
            </Menubar.Item>
          </Menubar.Content>
        </Menubar.Portal>
      </Menubar.Menu>
      <Menubar.Menu>
        <Menubar.Trigger>View</Menubar.Trigger>
        <Menubar.Portal>
          <Menubar.Content class="popup">
            <Menubar.CheckboxItem class="item">
              <Menubar.ItemIndicator>✓</Menubar.ItemIndicator>
              Sidebar
            </Menubar.CheckboxItem>
          </Menubar.Content>
        </Menubar.Portal>
      </Menubar.Menu>
    </Menubar>
  );
}
