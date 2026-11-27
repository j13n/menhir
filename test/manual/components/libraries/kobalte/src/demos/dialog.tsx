// The parts by name, not the `Dialog` object: `AlertDialog` is that same
// object, so once the alert dialog's page is in the bundle `Dialog.Content`
// is the alert dialog's content, with role="alertdialog".
import * as Dialog from "@kobalte/core/dialog";
import { TextField } from "@kobalte/core/text-field";

function Body() {
  return (
    <>
      <Dialog.Title>Edit profile</Dialog.Title>
      <Dialog.Description>Change your display name.</Dialog.Description>
      <TextField class="stack">
        <TextField.Label>Name</TextField.Label>
        <TextField.Input />
      </TextField>
      <p class="row">
        <Dialog.CloseButton>Save</Dialog.CloseButton>
        <Dialog.CloseButton>Close</Dialog.CloseButton>
      </p>
    </>
  );
}

export default function DialogDemo() {
  return (
    <>
      <Dialog.Root>
        <Dialog.Trigger>Edit profile</Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay class="backdrop" />
          <Dialog.Content class="dialog">
            <Body />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <h2>Non-modal</h2>
      <Dialog.Root modal={false}>
        <Dialog.Trigger>Edit profile</Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Content class="dialog">
            <Body />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
