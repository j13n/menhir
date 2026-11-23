import { ContextMenu } from "menhir/context-menu";

const popup =
  "m-0 min-w-40 rounded-lg border border-stone-200 bg-white p-1 text-sm text-inherit shadow-lg transition-opacity duration-100 data-closed:opacity-0 dark:border-stone-700 dark:bg-stone-900 starting:data-open:opacity-0";
const item =
  "flex cursor-default items-center gap-2 rounded py-1.5 pr-2 pl-7 outline-none select-none data-active:bg-stone-100 data-disabled:opacity-50 dark:data-active:bg-stone-800";

export default function ContextMenuExample() {
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger
        tabindex="0"
        class="grid h-32 w-64 place-items-center rounded-lg border border-dashed border-stone-300 text-sm select-none [-webkit-touch-callout:none] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500 data-open:bg-stone-100 dark:border-stone-600 dark:data-open:bg-stone-800"
      >
        Right-click here
      </ContextMenu.Trigger>
      <ContextMenu.Popup aria-label="Photo" class={popup}>
        <ContextMenu.Item class={item}>Open</ContextMenu.Item>
        <ContextMenu.Item class={item}>Rename</ContextMenu.Item>
        <ContextMenu.Item class={item} disabled>
          Paste
        </ContextMenu.Item>
        <hr class="my-1 border-stone-200 dark:border-stone-700" />
        <ContextMenu.CheckboxItem class={item} defaultChecked>
          <ContextMenu.ItemIndicator class="-ml-5 w-3 data-unchecked:invisible">
            ✓
          </ContextMenu.ItemIndicator>
          Favorite
        </ContextMenu.CheckboxItem>
        <ContextMenu.Submenu>
          <ContextMenu.SubmenuTrigger
            class={`${item} after:ml-auto after:content-['›']`}
          >
            Share
          </ContextMenu.SubmenuTrigger>
          <ContextMenu.Popup class={popup}>
            <ContextMenu.Item class={item}>Email</ContextMenu.Item>
            <ContextMenu.Item class={item}>Messages</ContextMenu.Item>
          </ContextMenu.Popup>
        </ContextMenu.Submenu>
      </ContextMenu.Popup>
    </ContextMenu.Root>
  );
}
