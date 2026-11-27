import { Dialog } from "@base-ui/react/dialog";
import { Field } from "@base-ui/react/field";

function Content() {
  return (
    <>
      <Dialog.Title>Edit profile</Dialog.Title>
      <Dialog.Description>Change your display name.</Dialog.Description>
      <Field.Root className="stack">
        <Field.Label>Name</Field.Label>
        <Field.Control />
      </Field.Root>
      <p className="row">
        <Dialog.Close>Save</Dialog.Close>
        <Dialog.Close>Close</Dialog.Close>
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
          <Dialog.Backdrop className="backdrop" />
          <Dialog.Popup className="dialog">
            <Content />
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>

      <h2>Non-modal</h2>
      <Dialog.Root modal={false}>
        <Dialog.Trigger>Edit profile</Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Popup className="dialog">
            <Content />
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
