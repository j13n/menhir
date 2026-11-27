import { ContextMenu } from "@kobalte/core/context-menu";

export default function ContextMenuDemo() {
  return (
    <ContextMenu>
      <ContextMenu.Trigger class="target">Right-click here</ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Content class="popup">
          <ContextMenu.Item class="item">Cut</ContextMenu.Item>
          <ContextMenu.Item class="item">Copy</ContextMenu.Item>
          <ContextMenu.Item class="item" disabled>
            Paste
          </ContextMenu.Item>
          <ContextMenu.Separator class="separator" />
          <ContextMenu.CheckboxItem class="item">
            <ContextMenu.ItemIndicator>✓</ContextMenu.ItemIndicator>
            Show grid
          </ContextMenu.CheckboxItem>
          <ContextMenu.Sub>
            <ContextMenu.SubTrigger class="item">Share</ContextMenu.SubTrigger>
            <ContextMenu.Portal>
              <ContextMenu.SubContent class="popup">
                <ContextMenu.Item class="item">Email</ContextMenu.Item>
                <ContextMenu.Item class="item">Link</ContextMenu.Item>
              </ContextMenu.SubContent>
            </ContextMenu.Portal>
          </ContextMenu.Sub>
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu>
  );
}
