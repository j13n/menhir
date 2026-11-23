// A test menu: an "Edit" Trigger, a Popup with Copy, Cut and Paste unless
// children are given, and a button before and after it.
import type { JSX } from "@solidjs/web";

import { Menu } from "../../src/menu/index.ts";
import type { MenuPopupProps } from "../../src/menu/popup/MenuPopup.tsx";
import type { MenuRootProps } from "../../src/menu/root/MenuRoot.tsx";

export interface EditProps extends MenuRootProps {
  /** Props for the Popup. */
  popup?: Omit<MenuPopupProps, "children">;
  /** The Trigger, instead of the default one. */
  trigger?: JSX.Element;
}

export function Edit(props: EditProps) {
  return (
    <>
      <button type="button">Before</button>
      <Menu.Root
        open={props.open}
        defaultOpen={props.defaultOpen}
        onOpenChange={props.onOpenChange}
      >
        {props.trigger ?? <Menu.Trigger>Edit</Menu.Trigger>}
        <Menu.Popup
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
              <Menu.Item>Copy</Menu.Item>
              <Menu.Item>Cut</Menu.Item>
              <Menu.Item>Paste</Menu.Item>
            </>
          )}
        </Menu.Popup>
      </Menu.Root>
      <button type="button">After</button>
    </>
  );
}
