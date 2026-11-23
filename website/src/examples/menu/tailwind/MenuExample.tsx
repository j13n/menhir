import { Menu } from "menhir/menu";

const popup =
  "m-0 min-w-40 origin-(--transform-origin) rounded-lg border border-stone-200 bg-white p-1 text-sm text-inherit shadow-lg transition-[opacity,scale] duration-100 data-closed:scale-95 data-closed:opacity-0 dark:border-stone-700 dark:bg-stone-900 starting:data-open:scale-95 starting:data-open:opacity-0";
const item =
  "flex cursor-default items-center gap-2 rounded py-1.5 pr-2 pl-7 outline-none select-none data-active:bg-stone-100 data-disabled:opacity-50 dark:data-active:bg-stone-800";

export default function MenuExample() {
  return (
    <Menu.Root>
      <Menu.Trigger class="cursor-pointer rounded-md border border-stone-300 px-3 py-1.5 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500 dark:border-stone-600">
        Edit
      </Menu.Trigger>
      <Menu.Popup sideOffset={4} class={popup}>
        <Menu.Item class={item}>Copy</Menu.Item>
        <Menu.Item class={item}>Cut</Menu.Item>
        <Menu.Item class={item} disabled>
          Paste
        </Menu.Item>
        <hr class="my-1 border-stone-200 dark:border-stone-700" />
        <Menu.CheckboxItem class={item} defaultChecked>
          <Menu.ItemIndicator class="-ml-5 w-3 data-unchecked:invisible">
            ✓
          </Menu.ItemIndicator>
          Word wrap
        </Menu.CheckboxItem>
        <Menu.Submenu>
          <Menu.SubmenuTrigger
            class={`${item} after:ml-auto after:content-['›']`}
          >
            Share
          </Menu.SubmenuTrigger>
          <Menu.Popup class={popup}>
            <Menu.Item class={item}>Email</Menu.Item>
            <Menu.Item class={item}>Messages</Menu.Item>
          </Menu.Popup>
        </Menu.Submenu>
      </Menu.Popup>
    </Menu.Root>
  );
}
