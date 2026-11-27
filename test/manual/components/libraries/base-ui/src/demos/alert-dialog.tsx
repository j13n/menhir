import { AlertDialog } from "@base-ui/react/alert-dialog";

export default function AlertDialogDemo() {
  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger>Delete account</AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="backdrop" />
        <AlertDialog.Popup className="dialog">
          <AlertDialog.Title>Delete account?</AlertDialog.Title>
          <AlertDialog.Description>
            This cannot be undone.
          </AlertDialog.Description>
          <div className="row">
            <AlertDialog.Close>Cancel</AlertDialog.Close>
            <AlertDialog.Close>Delete</AlertDialog.Close>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
