import { Popover } from "menhir/popover";

export default function PopoverExample() {
  return (
    <Popover.Root>
      <Popover.Trigger class="cursor-pointer rounded-md border border-stone-300 px-3 py-1.5 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500 dark:border-stone-600">
        Notifications
      </Popover.Trigger>
      <Popover.Popup
        sideOffset={8}
        class="w-64 origin-(--transform-origin) overflow-visible rounded-lg border border-stone-200 bg-white p-4 text-sm text-inherit shadow-lg transition-[opacity,scale] duration-150 data-closed:scale-95 data-closed:opacity-0 dark:border-stone-700 dark:bg-stone-900 starting:data-open:scale-95 starting:data-open:opacity-0"
      >
        <Popover.Arrow class="absolute size-2.5 rotate-45 border-stone-200 bg-white data-[side=bottom]:-top-1.5 data-[side=bottom]:border-t data-[side=bottom]:border-l data-[side=left]:-right-1.5 data-[side=left]:border-t data-[side=left]:border-r data-[side=right]:-left-1.5 data-[side=right]:border-b data-[side=right]:border-l data-[side=top]:-bottom-1.5 data-[side=top]:border-r data-[side=top]:border-b dark:border-stone-700 dark:bg-stone-900" />
        <Popover.Title class="m-0 text-sm font-semibold">
          Notifications
        </Popover.Title>
        <Popover.Description class="mt-1 mb-3 text-stone-600 dark:text-stone-400">
          You are all caught up.
        </Popover.Description>
        <Popover.Close class="cursor-pointer rounded-md border border-stone-300 px-3 py-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500 dark:border-stone-600">
          Close
        </Popover.Close>
      </Popover.Popup>
    </Popover.Root>
  );
}
