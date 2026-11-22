import { Dialog } from "menhir/dialog";
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
    </>
  );
}
