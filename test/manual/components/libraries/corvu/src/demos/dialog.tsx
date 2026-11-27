import Dialog from "corvu/dialog";
import { Show } from "solid-js";

// The non-modal variant has no overlay: the page behind it stays in use.
function Example(props: { modal?: boolean; id: string }) {
  return (
    <Dialog modal={props.modal}>
      {(dialog) => (
        <>
          <Dialog.Trigger>Edit profile</Dialog.Trigger>
          <Dialog.Portal>
            <Show when={props.modal !== false}>
              <Dialog.Overlay class="backdrop" />
            </Show>
            <Dialog.Content class="dialog">
              <Dialog.Label>Edit profile</Dialog.Label>
              <Dialog.Description>Change your display name.</Dialog.Description>
              <div class="stack">
                <label for={props.id}>Name</label>
                <input id={props.id} type="text" />
              </div>
              <p class="row">
                <button type="button" onClick={() => dialog.setOpen(false)}>
                  Save
                </button>
                <Dialog.Close>Close</Dialog.Close>
              </p>
            </Dialog.Content>
          </Dialog.Portal>
        </>
      )}
    </Dialog>
  );
}

export default function DialogDemo() {
  return (
    <>
      <Example id="dialog-name" />

      <h2>Non-modal</h2>
      <Example id="dialog-name-non-modal" modal={false} />
    </>
  );
}
