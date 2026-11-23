// Rendered on the server and hydrated in the test, so both sides get the
// same tree: a closed Context Menu with a submenu, and one open by default,
// which the server renders closed (README, "Decisions").
import { ContextMenu } from "../../src/context-menu/index.ts";

export default function ContextMenuFixture() {
  return (
    <>
      <ContextMenu.Root>
        <ContextMenu.Trigger data-testid="files" tabindex="0">
          Files
        </ContextMenu.Trigger>
        <ContextMenu.Popup aria-label="File" data-testid="file">
          <ContextMenu.Item>Copy</ContextMenu.Item>
          <ContextMenu.CheckboxItem defaultChecked>
            <ContextMenu.ItemIndicator />
            Pin
          </ContextMenu.CheckboxItem>
          <ContextMenu.Submenu>
            <ContextMenu.SubmenuTrigger>Share</ContextMenu.SubmenuTrigger>
            <ContextMenu.Popup data-testid="share">
              <ContextMenu.Item>Email</ContextMenu.Item>
            </ContextMenu.Popup>
          </ContextMenu.Submenu>
        </ContextMenu.Popup>
      </ContextMenu.Root>
      <ContextMenu.Root defaultOpen>
        <ContextMenu.Trigger data-testid="canvas">Canvas</ContextMenu.Trigger>
        <ContextMenu.Popup aria-label="Canvas" data-testid="view">
          <ContextMenu.Item>Zoom in</ContextMenu.Item>
        </ContextMenu.Popup>
      </ContextMenu.Root>
    </>
  );
}
