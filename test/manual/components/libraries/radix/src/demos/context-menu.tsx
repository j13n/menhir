import { ContextMenu } from "radix-ui";
import { useState } from "react";

export default function ContextMenuDemo() {
  const [grid, setGrid] = useState(false);
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger className="target">
        Right-click here
      </ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Content className="popup">
          <ContextMenu.Item className="item">Cut</ContextMenu.Item>
          <ContextMenu.Item className="item">Copy</ContextMenu.Item>
          <ContextMenu.Item className="item" disabled>
            Paste
          </ContextMenu.Item>
          <ContextMenu.Separator className="separator" />
          <ContextMenu.CheckboxItem
            className="item"
            checked={grid}
            onCheckedChange={setGrid}
          >
            <ContextMenu.ItemIndicator className="mark" />
            Show grid
          </ContextMenu.CheckboxItem>
          <ContextMenu.Sub>
            <ContextMenu.SubTrigger className="item">
              Share
            </ContextMenu.SubTrigger>
            <ContextMenu.Portal>
              <ContextMenu.SubContent className="popup">
                <ContextMenu.Item className="item">Email</ContextMenu.Item>
                <ContextMenu.Item className="item">Link</ContextMenu.Item>
              </ContextMenu.SubContent>
            </ContextMenu.Portal>
          </ContextMenu.Sub>
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
}
