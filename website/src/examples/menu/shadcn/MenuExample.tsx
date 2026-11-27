import { Menu } from "menhir/menu";

const popup =
  "min-w-32 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground transition-[opacity,scale] duration-150 data-closed:scale-95 data-closed:opacity-0 motion-reduce:transition-none starting:data-open:scale-95 starting:data-open:opacity-0";
const item =
  "relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-active:bg-accent data-active:text-accent-foreground data-disabled:opacity-50";
// A checkbox or radio item makes room for its indicator at its start.
const checkable = `${item} ps-8`;
const indicator =
  "pointer-events-none absolute inset-s-2 flex size-3.5 items-center justify-center data-unchecked:hidden";
const separator = "-mx-1 my-1 h-px border-0 bg-border";

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="size-4"
    >
      <path d="M4 12l5 5L20 6" />
    </svg>
  );
}

export default function MenuExample() {
  return (
    <Menu.Root>
      <Menu.Trigger class="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md border bg-background px-4 py-2 text-sm font-medium whitespace-nowrap shadow-xs transition-all outline-none hover:bg-accent hover:text-accent-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 dark:border-input dark:bg-input/30 dark:hover:bg-input/50 motion-reduce:transition-none">
        Edit
      </Menu.Trigger>
      <Menu.Popup sideOffset={4} class={`${popup} shadow-md`}>
        <Menu.Item class={item}>Cut</Menu.Item>
        <Menu.Item class={item}>Copy</Menu.Item>
        <Menu.Item class={item} disabled>
          Paste
        </Menu.Item>
        <hr class={separator} />
        <Menu.CheckboxItem class={checkable} defaultChecked>
          <Menu.ItemIndicator class={indicator}>
            <CheckIcon />
          </Menu.ItemIndicator>
          Word wrap
        </Menu.CheckboxItem>
        <hr class={separator} />
        <Menu.RadioGroup defaultValue="comfortable">
          <Menu.GroupLabel class="px-2 py-1.5 text-sm font-medium">
            Line spacing
          </Menu.GroupLabel>
          <Menu.RadioItem class={checkable} value="compact">
            <Menu.ItemIndicator class={indicator}>
              <span class="size-2 rounded-full bg-current" />
            </Menu.ItemIndicator>
            Compact
          </Menu.RadioItem>
          <Menu.RadioItem class={checkable} value="comfortable">
            <Menu.ItemIndicator class={indicator}>
              <span class="size-2 rounded-full bg-current" />
            </Menu.ItemIndicator>
            Comfortable
          </Menu.RadioItem>
        </Menu.RadioGroup>
        <hr class={separator} />
        <Menu.Submenu>
          <Menu.SubmenuTrigger
            class={`${item} data-open:bg-accent data-open:text-accent-foreground`}
          >
            Share
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="ms-auto size-4 rtl:rotate-180"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </Menu.SubmenuTrigger>
          {/* Up by the Popup's padding and border, so that its first item
              lines up with the SubmenuTrigger. */}
          <Menu.Popup alignOffset={-5} class={`${popup} shadow-lg`}>
            <Menu.Item class={item}>Email</Menu.Item>
            <Menu.Item class={item}>Messages</Menu.Item>
          </Menu.Popup>
        </Menu.Submenu>
      </Menu.Popup>
    </Menu.Root>
  );
}
