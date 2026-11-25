// test/menu/Edit.tsx as a Context Menu: an "Edit" area, a Popup named
// "Edit" with Copy, Cut and Paste unless children are given, and a button
// before and after it.
import { ContextMenu } from "../../src/context-menu/index.ts";
import type { MenuPopupProps } from "../../src/menu/popup/MenuPopup.tsx";
import { editWith } from "../menu/Edit.tsx";

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

export const Edit = editWith({
  Root: ContextMenu.Root,
  Trigger: () => area(),
  // Named, as a Context Menu's Trigger labels nothing, and unpadded.
  Popup: (props: MenuPopupProps) => (
    <ContextMenu.Popup
      {...props}
      aria-label={props["aria-label"] ?? "Edit"}
      style={
        props.style ?? {
          width: "100px",
          padding: "0",
          border: "0",
          margin: "0",
        }
      }
    />
  ),
});
