// test/menu/Share.tsx as a Menubar: a bar of one "Edit" menu with Copy,
// "Share ▸" (Email, Messages, "More ▸" (Print, Save)), Paste, where Menu's
// Trigger sits, and a button before and after it. Items are 30 px tall and
// the Popups 120 px wide.
import type { MenuRootProps } from "../../src/menu/root/MenuRoot.tsx";
import { Menubar } from "../../src/menubar/index.ts";
import { shareWith } from "../menu/Share.tsx";
import { Bar } from "./Edit.tsx";

export const Share = shareWith({
  // The button is where Shift+Tab from the bar sends focus (kinds.tsx).
  Root: (props: MenuRootProps) => (
    <>
      <button type="button">Before</button>
      <Bar {...props} />
    </>
  ),
  // The bar's item takes the place itself: the bar around it is not placed.
  Trigger: Menubar.Trigger,
  Popup: Menubar.Popup,
});
