// A test context menu: an "Edit" area, a Popup with Copy, Cut and Paste
// unless children are given, and a button before and after it.
import type { JSX } from "@solidjs/web";

import { ContextMenu } from "../../src/context-menu/index.ts";
import type { ContextMenuRootProps } from "../../src/context-menu/root/ContextMenuRoot.tsx";
import type { MenuPopupProps } from "../../src/menu/popup/MenuPopup.tsx";

export interface EditProps extends ContextMenuRootProps {
  /** Props for the Popup. */
  popup?: Omit<MenuPopupProps, "children">;
  /** The Trigger, instead of the default one. */
  trigger?: JSX.Element;
}

/** A 200 by 100 area fixed at (20, 40), focusable, holding a "Focus" button. */
export const area = (props: { disabled?: boolean } = {}) => (
  <ContextMenu.Trigger
    data-testid="area"
    tabindex="0"
    disabled={props.disabled}
    style={{
      position: "fixed",
      left: "20px",
      top: "40px",
      width: "200px",
      height: "100px",
      margin: 0,
      padding: 0,
      border: 0,
    }}
  >
    Edit
    <button
      type="button"
      style={{
        position: "absolute",
        left: "100px",
        top: "50px",
        width: "60px",
        height: "20px",
        margin: 0,
        padding: 0,
        border: 0,
      }}
    >
      Focus
    </button>
  </ContextMenu.Trigger>
);

export function Edit(props: EditProps) {
  return (
    <>
      <button type="button">Before</button>
      <ContextMenu.Root
        open={props.open}
        defaultOpen={props.defaultOpen}
        onOpenChange={props.onOpenChange}
      >
        {props.trigger ?? area()}
        <ContextMenu.Popup
          side={props.popup?.side}
          align={props.popup?.align}
          sideOffset={props.popup?.sideOffset}
          alignOffset={props.popup?.alignOffset}
          collisionPadding={props.popup?.collisionPadding}
          anchor={props.popup?.anchor}
          returnFocus={props.popup?.returnFocus}
          aria-label={props.popup?.["aria-label"] ?? "Edit"}
          style={
            props.popup?.style ?? {
              width: "100px",
              padding: "0",
              border: "0",
              margin: "0",
            }
          }
        >
          {props.children ?? (
            <>
              <ContextMenu.Item>Copy</ContextMenu.Item>
              <ContextMenu.Item>Cut</ContextMenu.Item>
              <ContextMenu.Item>Paste</ContextMenu.Item>
            </>
          )}
        </ContextMenu.Popup>
      </ContextMenu.Root>
      <button type="button">After</button>
    </>
  );
}
