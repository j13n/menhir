import { AlertDialog } from "menhir/alert-dialog";

import "./alert-dialog.css";

export default function AlertDialogExample() {
  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger class="alert-dialog-button">
        Delete file
      </AlertDialog.Trigger>
      <AlertDialog.Popup class="alert-dialog-popup">
        <AlertDialog.Title class="alert-dialog-title">
          Delete this file?
        </AlertDialog.Title>
        <AlertDialog.Description class="alert-dialog-description">
          It cannot be undone.
        </AlertDialog.Description>
        <div class="alert-dialog-actions">
          {/* First, so that it takes focus: the least destructive action. */}
          <AlertDialog.Close class="alert-dialog-button">
            Cancel
          </AlertDialog.Close>
          <AlertDialog.Close class="alert-dialog-button alert-dialog-destructive">
            Delete
          </AlertDialog.Close>
        </div>
      </AlertDialog.Popup>
    </AlertDialog.Root>
  );
}
