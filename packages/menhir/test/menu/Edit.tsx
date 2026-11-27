// A test menu: an "Edit" Trigger, a Popup with Copy, Cut and Paste unless
// children are given, and a button before and after it. `editWith` builds
// it from another menu's Root, Trigger and Popup, as Context Menu's and
// Menubar's.
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

/** The parts a test menu takes from its component; the items are Menu's. */
export interface EditParts {
  Root(props: MenuRootProps): JSX.Element;
  /** The default Trigger, with its text. */
  Trigger(): JSX.Element;
  Popup(props: MenuPopupProps): JSX.Element;
}

/** The test menu, built from `parts`. */
export function editWith(parts: EditParts) {
  return (props: EditProps) => (
    <>
      <button type="button">Before</button>
      <parts.Root
        open={props.open}
        defaultOpen={props.defaultOpen}
        onOpenChange={props.onOpenChange}
      >
        {props.trigger ?? <parts.Trigger />}
        <parts.Popup
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
        </parts.Popup>
      </parts.Root>
      <button type="button">After</button>
    </>
  );
}

export const Edit = editWith({
  Root: Menu.Root,
  Trigger: () => <Menu.Trigger>Edit</Menu.Trigger>,
  Popup: Menu.Popup,
});
