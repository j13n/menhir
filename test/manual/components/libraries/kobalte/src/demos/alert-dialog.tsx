// The parts by name, not the `AlertDialog` object: see ./dialog.tsx.
import * as AlertDialog from "@kobalte/core/alert-dialog";

export default function AlertDialogDemo() {
  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger>Delete account</AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay class="backdrop" />
        <AlertDialog.Content class="dialog">
          <AlertDialog.Title>Delete account?</AlertDialog.Title>
          <AlertDialog.Description>
            This cannot be undone.
          </AlertDialog.Description>
          <div class="row">
            <AlertDialog.CloseButton>Cancel</AlertDialog.CloseButton>
            <AlertDialog.CloseButton>Delete</AlertDialog.CloseButton>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
