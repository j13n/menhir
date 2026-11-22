import { AlertDialog } from "menhir/alert-dialog";

export default function AlertDialogExample() {
  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger class="cursor-pointer rounded-md border border-stone-300 px-3 py-1.5 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500 dark:border-stone-600">
        Delete file
      </AlertDialog.Trigger>
      <AlertDialog.Popup class="m-auto w-[min(24rem,calc(100%-2rem))] rounded-xl bg-white p-6 text-sm text-inherit transition-opacity duration-150 backdrop:bg-black/40 backdrop:backdrop-blur-xs backdrop:transition-opacity backdrop:duration-150 data-closed:opacity-0 data-closed:backdrop:opacity-0 dark:bg-stone-900 starting:open:opacity-0 starting:open:backdrop:opacity-0">
        <AlertDialog.Title class="m-0 text-base font-semibold">
          Delete this file?
        </AlertDialog.Title>
        <AlertDialog.Description class="mt-2 text-stone-600 dark:text-stone-400">
          It cannot be undone.
        </AlertDialog.Description>
        <div class="mt-6 flex justify-end gap-2">
          {/* First, so that it takes focus: the least destructive action. */}
          <AlertDialog.Close class="cursor-pointer rounded-md border border-stone-300 px-3 py-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500 dark:border-stone-600">
            Cancel
          </AlertDialog.Close>
          <AlertDialog.Close class="cursor-pointer rounded-md bg-red-700 px-3 py-1.5 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700">
            Delete
          </AlertDialog.Close>
        </div>
      </AlertDialog.Popup>
    </AlertDialog.Root>
  );
}
