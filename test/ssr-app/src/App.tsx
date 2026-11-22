import { Dialog } from "menhir/dialog";
import { Popover } from "menhir/popover";
import { Switch } from "menhir/switch";

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
    </>
  );
}
