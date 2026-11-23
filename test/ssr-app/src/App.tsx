import { Dialog } from "menhir/dialog";
import { Menu } from "menhir/menu";
import { NavigationMenu } from "menhir/navigation-menu";
import { Popover } from "menhir/popover";
import { Switch } from "menhir/switch";
import { Tooltip } from "menhir/tooltip";

export function App() {
  return (
    <>
      <Switch.Root />
      <Dialog.Root>
        <Dialog.Trigger>Edit</Dialog.Trigger>
        <Dialog.Popup>
          <Dialog.Title>Edit profile</Dialog.Title>
          <Dialog.Close>Done</Dialog.Close>
        </Dialog.Popup>
      </Dialog.Root>
      <Popover.Root>
        <Popover.Trigger>Notifications</Popover.Trigger>
        <Popover.Popup>
          <Popover.Arrow />
          <Popover.Title>All caught up</Popover.Title>
          <Popover.Close>Close</Popover.Close>
        </Popover.Popup>
      </Popover.Root>
      <Tooltip.Root>
        <Tooltip.Trigger>Bold</Tooltip.Trigger>
        <Tooltip.Popup>
          <Tooltip.Arrow />
          Ctrl+B
        </Tooltip.Popup>
      </Tooltip.Root>
      <NavigationMenu.Root aria-label="Main">
        <ul>
          <NavigationMenu.Item>
            <NavigationMenu.Trigger>Products</NavigationMenu.Trigger>
            <NavigationMenu.Panel>
              <NavigationMenu.Link href="/switch">Switch</NavigationMenu.Link>
            </NavigationMenu.Panel>
          </NavigationMenu.Item>
        </ul>
      </NavigationMenu.Root>
      <Menu.Root>
        <Menu.Trigger>Actions</Menu.Trigger>
        <Menu.Popup>
          <Menu.Item>Copy</Menu.Item>
          <Menu.Submenu>
            <Menu.SubmenuTrigger>Share</Menu.SubmenuTrigger>
            <Menu.Popup>
              <Menu.Item>Email</Menu.Item>
            </Menu.Popup>
          </Menu.Submenu>
        </Menu.Popup>
      </Menu.Root>
    </>
  );
}
