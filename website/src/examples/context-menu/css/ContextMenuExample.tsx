import { ContextMenu } from "menhir/context-menu";

import "./context-menu.css";

export default function ContextMenuExample() {
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger class="context-menu-area" tabindex="0">
        Right-click here
      </ContextMenu.Trigger>
      <ContextMenu.Popup class="context-menu-popup" aria-label="Photo">
        <ContextMenu.Item class="context-menu-item">Open</ContextMenu.Item>
        <ContextMenu.Item class="context-menu-item">Rename</ContextMenu.Item>
        <ContextMenu.Item class="context-menu-item" disabled>
          Paste
        </ContextMenu.Item>
        <hr class="context-menu-separator" />
        <ContextMenu.CheckboxItem class="context-menu-item" defaultChecked>
          <ContextMenu.ItemIndicator class="context-menu-indicator">
            ✓
          </ContextMenu.ItemIndicator>
          Favorite
        </ContextMenu.CheckboxItem>
        <ContextMenu.Submenu>
          <ContextMenu.SubmenuTrigger class="context-menu-item context-menu-submenu-trigger">
            Share
          </ContextMenu.SubmenuTrigger>
          <ContextMenu.Popup class="context-menu-popup">
            <ContextMenu.Item class="context-menu-item">Email</ContextMenu.Item>
            <ContextMenu.Item class="context-menu-item">
              Messages
            </ContextMenu.Item>
          </ContextMenu.Popup>
        </ContextMenu.Submenu>
      </ContextMenu.Popup>
    </ContextMenu.Root>
  );
}
