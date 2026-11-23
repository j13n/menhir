import { Menubar } from "menhir/menubar";

import "./menubar.css";

export default function MenubarExample() {
  return (
    <Menubar.Root class="menubar" aria-label="Editor">
      <Menubar.Menu>
        <Menubar.Trigger class="menubar-trigger">File</Menubar.Trigger>
        <Menubar.Popup class="menubar-popup" sideOffset={4}>
          <Menubar.Item class="menubar-item">New</Menubar.Item>
          <Menubar.Item class="menubar-item">Open…</Menubar.Item>
          <hr class="menubar-separator" />
          <Menubar.Submenu>
            <Menubar.SubmenuTrigger class="menubar-item menubar-submenu-trigger">
              Share
            </Menubar.SubmenuTrigger>
            <Menubar.Popup class="menubar-popup">
              <Menubar.Item class="menubar-item">Email</Menubar.Item>
              <Menubar.Item class="menubar-item">Messages</Menubar.Item>
            </Menubar.Popup>
          </Menubar.Submenu>
        </Menubar.Popup>
      </Menubar.Menu>
      <Menubar.Menu>
        <Menubar.Trigger class="menubar-trigger">Edit</Menubar.Trigger>
        <Menubar.Popup class="menubar-popup" sideOffset={4}>
          <Menubar.Item class="menubar-item">Undo</Menubar.Item>
          <Menubar.Item class="menubar-item" disabled>
            Redo
          </Menubar.Item>
          <hr class="menubar-separator" />
          <Menubar.Item class="menubar-item">Copy</Menubar.Item>
          <Menubar.Item class="menubar-item">Paste</Menubar.Item>
        </Menubar.Popup>
      </Menubar.Menu>
      <Menubar.Menu>
        <Menubar.Trigger class="menubar-trigger">View</Menubar.Trigger>
        <Menubar.Popup class="menubar-popup" sideOffset={4}>
          <Menubar.CheckboxItem class="menubar-item" defaultChecked>
            <Menubar.ItemIndicator class="menubar-indicator">
              ✓
            </Menubar.ItemIndicator>
            Word wrap
          </Menubar.CheckboxItem>
          <Menubar.CheckboxItem class="menubar-item">
            <Menubar.ItemIndicator class="menubar-indicator">
              ✓
            </Menubar.ItemIndicator>
            Minimap
          </Menubar.CheckboxItem>
        </Menubar.Popup>
      </Menubar.Menu>
    </Menubar.Root>
  );
}
