// test/menu/Share.tsx as a Context Menu: Copy, "Share ▸" (Email, Messages,
// "More ▸" (Print, Save)), Paste, opened from a focusable "Edit" area where
// Menu's Trigger sits. Items are 30 px tall and the Popups 120 px wide.
import type { JSX } from "@solidjs/web";

import { ContextMenu } from "../../src/context-menu/index.ts";
import { shareWith } from "../menu/Share.tsx";

export const Share = shareWith({
  Root: ContextMenu.Root,
  // Focusable, and sized, as a <div> is not shrunk to its text.
  Trigger: (props: { style: JSX.CSSProperties; children: JSX.Element }) => (
    <ContextMenu.Trigger
      data-testid="area"
      tabindex="0"
      style={{ ...props.style, width: "40px", height: "20px" }}
    >
      {props.children}
    </ContextMenu.Trigger>
  ),
  Popup: ContextMenu.Popup,
  label: "Edit",
});
