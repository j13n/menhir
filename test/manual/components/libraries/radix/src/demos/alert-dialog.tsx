import { AlertDialog } from "radix-ui";

export default function AlertDialogDemo() {
  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger>Delete account</AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="backdrop" />
        <AlertDialog.Content className="dialog">
          <AlertDialog.Title>Delete account?</AlertDialog.Title>
          <AlertDialog.Description>
            This cannot be undone.
          </AlertDialog.Description>
          <div className="row">
            <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
            <AlertDialog.Action>Delete</AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
