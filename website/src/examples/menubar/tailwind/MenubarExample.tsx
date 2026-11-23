import { Menubar } from "menhir/menubar";

const trigger =
  "cursor-default rounded px-3 py-1 text-sm hover:bg-stone-100 data-open:bg-stone-100 dark:hover:bg-stone-800 dark:data-open:bg-stone-800";
const popup =
  "m-0 min-w-40 rounded-lg border border-stone-200 bg-white p-1 text-sm text-inherit shadow-lg transition-opacity duration-100 data-closed:opacity-0 dark:border-stone-700 dark:bg-stone-900 starting:data-open:opacity-0";
const item =
  "flex cursor-default items-center gap-2 rounded py-1.5 pr-2 pl-7 outline-none select-none data-active:bg-stone-100 data-disabled:opacity-50 dark:data-active:bg-stone-800";
const separator = "my-1 border-stone-200 dark:border-stone-700";
const indicator = "-ml-5 w-3 data-unchecked:invisible";

export default function MenubarExample() {
  return (
    <Menubar.Root
      aria-label="Editor"
      class="flex gap-0.5 rounded-lg border border-stone-200 p-1 dark:border-stone-700"
    >
      <Menubar.Menu>
        <Menubar.Trigger class={trigger}>File</Menubar.Trigger>
        <Menubar.Popup class={popup} sideOffset={4}>
          <Menubar.Item class={item}>New</Menubar.Item>
          <Menubar.Item class={item}>Open…</Menubar.Item>
          <hr class={separator} />
          <Menubar.Submenu>
            <Menubar.SubmenuTrigger
              class={`${item} after:ml-auto after:content-['›']`}
            >
              Share
            </Menubar.SubmenuTrigger>
            <Menubar.Popup class={popup}>
              <Menubar.Item class={item}>Email</Menubar.Item>
              <Menubar.Item class={item}>Messages</Menubar.Item>
            </Menubar.Popup>
          </Menubar.Submenu>
        </Menubar.Popup>
      </Menubar.Menu>
      <Menubar.Menu>
        <Menubar.Trigger class={trigger}>Edit</Menubar.Trigger>
        <Menubar.Popup class={popup} sideOffset={4}>
          <Menubar.Item class={item}>Undo</Menubar.Item>
          <Menubar.Item class={item} disabled>
            Redo
          </Menubar.Item>
          <hr class={separator} />
          <Menubar.Item class={item}>Copy</Menubar.Item>
          <Menubar.Item class={item}>Paste</Menubar.Item>
        </Menubar.Popup>
      </Menubar.Menu>
      <Menubar.Menu>
        <Menubar.Trigger class={trigger}>View</Menubar.Trigger>
        <Menubar.Popup class={popup} sideOffset={4}>
          <Menubar.CheckboxItem class={item} defaultChecked>
            <Menubar.ItemIndicator class={indicator}>✓</Menubar.ItemIndicator>
            Word wrap
          </Menubar.CheckboxItem>
          <Menubar.CheckboxItem class={item}>
            <Menubar.ItemIndicator class={indicator}>✓</Menubar.ItemIndicator>
            Minimap
          </Menubar.CheckboxItem>
        </Menubar.Popup>
      </Menubar.Menu>
    </Menubar.Root>
  );
}
