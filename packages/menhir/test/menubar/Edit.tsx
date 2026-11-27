// test/menu/Edit.tsx as a Menubar: a bar of one "Edit" menu with Copy, Cut
// and Paste unless children are given, and a button before and after it.
import type { MenuRootProps } from "../../src/menu/root/MenuRoot.tsx";
import { Menubar } from "../../src/menubar/index.ts";
import { editWith } from "../menu/Edit.tsx";

/** A bar, "Editor", of one menu, in place of Menu's Root: the menu takes the Root's props. */
export const Bar = (props: MenuRootProps) => (
  <Menubar.Root aria-label="Editor">
    <Menubar.Menu
      open={props.open}
      defaultOpen={props.defaultOpen}
      onOpenChange={props.onOpenChange}
    >
      {props.children}
    </Menubar.Menu>
  </Menubar.Root>
);

export const Edit = editWith({
  Root: Bar,
  Trigger: () => <Menubar.Trigger>Edit</Menubar.Trigger>,
  Popup: Menubar.Popup,
});
