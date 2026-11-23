// test/menu/Edit.tsx as a Menubar: a bar of one "Edit" menu with Copy, Cut
// and Paste unless children are given, and a button before and after it.
import { Menubar } from "../../src/menubar/index.ts";
import type { EditProps } from "../menu/Edit.tsx";

export function Edit(props: EditProps) {
  return (
    <>
      <button type="button">Before</button>
      <Menubar.Root aria-label="Editor">
        <Menubar.Menu
          open={props.open}
          defaultOpen={props.defaultOpen}
          onOpenChange={props.onOpenChange}
        >
          {props.trigger ?? <Menubar.Trigger>Edit</Menubar.Trigger>}
          <Menubar.Popup
            side={props.popup?.side}
            align={props.popup?.align}
            sideOffset={props.popup?.sideOffset}
            alignOffset={props.popup?.alignOffset}
            collisionPadding={props.popup?.collisionPadding}
            anchor={props.popup?.anchor}
            returnFocus={props.popup?.returnFocus}
            aria-label={props.popup?.["aria-label"]}
            aria-labelledby={props.popup?.["aria-labelledby"]}
            style={props.popup?.style}
          >
            {props.children ?? (
              <>
                <Menubar.Item>Copy</Menubar.Item>
                <Menubar.Item>Cut</Menubar.Item>
                <Menubar.Item>Paste</Menubar.Item>
              </>
            )}
          </Menubar.Popup>
        </Menubar.Menu>
      </Menubar.Root>
      <button type="button">After</button>
    </>
  );
}
