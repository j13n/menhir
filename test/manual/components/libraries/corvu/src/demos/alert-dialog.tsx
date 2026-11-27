import Dialog from "corvu/dialog";

// corvu has no separate alert dialog: it is the dialog with
// `role="alertdialog"`. Everything else is the dialog's default.
export default function AlertDialogDemo() {
  return (
    <Dialog role="alertdialog">
      {(props) => (
        <>
          <Dialog.Trigger>Delete account</Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay class="backdrop" />
            <Dialog.Content class="dialog">
              <Dialog.Label>Delete account?</Dialog.Label>
              <Dialog.Description>This cannot be undone.</Dialog.Description>
              <div class="row">
                <Dialog.Close>Cancel</Dialog.Close>
                <button type="button" onClick={() => props.setOpen(false)}>
                  Delete
                </button>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </>
      )}
    </Dialog>
  );
}
