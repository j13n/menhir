import { ContextMenu } from "@base-ui/react/context-menu";

export default function ContextMenuDemo() {
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger className="target">
        Right-click here
      </ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Positioner className="positioner">
          <ContextMenu.Popup className="popup">
            <ContextMenu.Item className="item">Cut</ContextMenu.Item>
            <ContextMenu.Item className="item">Copy</ContextMenu.Item>
            <ContextMenu.Item className="item" disabled>
              Paste
            </ContextMenu.Item>
            <ContextMenu.Separator className="separator" />
            <ContextMenu.CheckboxItem className="item">
              Show grid
              <ContextMenu.CheckboxItemIndicator className="check" />
            </ContextMenu.CheckboxItem>
            <ContextMenu.SubmenuRoot>
              <ContextMenu.SubmenuTrigger className="item submenu-trigger">
                Share
              </ContextMenu.SubmenuTrigger>
              <ContextMenu.Portal>
                <ContextMenu.Positioner className="positioner">
                  <ContextMenu.Popup className="popup">
                    <ContextMenu.Item className="item">Email</ContextMenu.Item>
                    <ContextMenu.Item className="item">Link</ContextMenu.Item>
                  </ContextMenu.Popup>
                </ContextMenu.Positioner>
              </ContextMenu.Portal>
            </ContextMenu.SubmenuRoot>
          </ContextMenu.Popup>
        </ContextMenu.Positioner>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
}
