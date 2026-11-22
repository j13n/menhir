import { Dialog } from "menhir/dialog";

import "./dialog.css";

export default function DialogExample() {
  return (
    <Dialog.Root>
      <Dialog.Trigger class="dialog-trigger">Edit profile</Dialog.Trigger>
      <Dialog.Popup class="dialog-popup">
        <Dialog.Title class="dialog-title">Edit profile</Dialog.Title>
        <Dialog.Description class="dialog-description">
          Your name is shown on your posts.
        </Dialog.Description>
        <label class="dialog-field">
          Name
          <input name="name" value="Ada Lovelace" />
        </label>
        <div class="dialog-actions">
          <Dialog.Close class="dialog-close">Done</Dialog.Close>
        </div>
      </Dialog.Popup>
    </Dialog.Root>
  );
}
