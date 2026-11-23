import { Menu } from "menhir/menu";

import "./menu.css";

export default function MenuExample() {
  return (
    <Menu.Root>
      <Menu.Trigger class="menu-trigger">Edit</Menu.Trigger>
      <Menu.Popup class="menu-popup" sideOffset={4}>
        <Menu.Item class="menu-item">Copy</Menu.Item>
        <Menu.Item class="menu-item">Cut</Menu.Item>
        <Menu.Item class="menu-item" disabled>
          Paste
        </Menu.Item>
        <hr class="menu-separator" />
        <Menu.CheckboxItem class="menu-item" defaultChecked>
          <Menu.ItemIndicator class="menu-indicator">✓</Menu.ItemIndicator>
          Word wrap
        </Menu.CheckboxItem>
        <Menu.Submenu>
          <Menu.SubmenuTrigger class="menu-item menu-submenu-trigger">
            Share
          </Menu.SubmenuTrigger>
          <Menu.Popup class="menu-popup">
            <Menu.Item class="menu-item">Email</Menu.Item>
            <Menu.Item class="menu-item">Messages</Menu.Item>
          </Menu.Popup>
        </Menu.Submenu>
      </Menu.Popup>
    </Menu.Root>
  );
}
