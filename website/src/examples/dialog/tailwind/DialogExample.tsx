import { Dialog } from "menhir/dialog";

export default function DialogExample() {
  return (
    <Dialog.Root>
      <Dialog.Trigger class="cursor-pointer rounded-md border border-stone-300 px-3 py-1.5 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500 dark:border-stone-600">
        Edit profile
      </Dialog.Trigger>
      <Dialog.Popup class="m-auto w-[min(24rem,calc(100%-2rem))] rounded-xl bg-white p-6 text-sm text-inherit transition-opacity duration-150 backdrop:bg-black/40 backdrop:backdrop-blur-xs backdrop:transition-opacity backdrop:duration-150 data-closed:opacity-0 data-closed:backdrop:opacity-0 dark:bg-stone-900 starting:open:opacity-0 starting:open:backdrop:opacity-0">
        <Dialog.Title class="m-0 text-base font-semibold">
          Edit profile
        </Dialog.Title>
        <Dialog.Description class="mt-2 mb-4 text-stone-600 dark:text-stone-400">
          Your name is shown on your posts.
        </Dialog.Description>
        <label class="grid gap-1">
          Name
          <input
            name="name"
            value="Ada Lovelace"
            class="rounded-md border border-stone-300 px-2 py-1 dark:border-stone-600"
          />
        </label>
        <div class="mt-6 flex justify-end">
          <Dialog.Close class="cursor-pointer rounded-md border border-stone-300 px-3 py-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500 dark:border-stone-600">
            Done
          </Dialog.Close>
        </div>
      </Dialog.Popup>
    </Dialog.Root>
  );
}
