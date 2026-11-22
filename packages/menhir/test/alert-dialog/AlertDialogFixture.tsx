// Rendered on the server and hydrated in the test, so both sides get the
// same tree: a closed Alert Dialog, and one open by default, which the server
// renders closed (src/dialog/README.md, "Decisions").
import { AlertDialog } from "../../src/alert-dialog/index.ts";

export default function AlertDialogFixture() {
  return (
    <>
      <AlertDialog.Root>
        <AlertDialog.Trigger>Delete file</AlertDialog.Trigger>
        <AlertDialog.Popup data-testid="delete">
          <AlertDialog.Title>Delete this file?</AlertDialog.Title>
          <AlertDialog.Description>
            It cannot be undone.
          </AlertDialog.Description>
          <AlertDialog.Close>Cancel</AlertDialog.Close>
          <AlertDialog.Close>Delete</AlertDialog.Close>
        </AlertDialog.Popup>
      </AlertDialog.Root>
      <AlertDialog.Root defaultOpen>
        <AlertDialog.Popup data-testid="expired">
          <AlertDialog.Title>Session expired</AlertDialog.Title>
          <AlertDialog.Description>
            Sign in again to go on.
          </AlertDialog.Description>
          <AlertDialog.Close>Sign in</AlertDialog.Close>
        </AlertDialog.Popup>
      </AlertDialog.Root>
    </>
  );
}
