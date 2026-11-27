import { Dialog, Label } from "radix-ui";

function Body(props: { id: string }) {
  return (
    <>
      <Dialog.Title>Edit profile</Dialog.Title>
      <Dialog.Description>Change your display name.</Dialog.Description>
      <div className="stack">
        <Label.Root htmlFor={props.id}>Name</Label.Root>
        <input id={props.id} />
      </div>
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
          <Dialog.Overlay className="backdrop" />
          <Dialog.Content className="dialog">
            <Body id="name" />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <h2>Non-modal</h2>
      <Dialog.Root modal={false}>
        <Dialog.Trigger>Edit profile</Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Content className="dialog">
            <Body id="name-non-modal" />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
