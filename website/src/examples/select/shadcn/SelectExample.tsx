import { Select } from "menhir/select";

const item =
  "relative flex cursor-default items-center gap-2 rounded-sm py-1.5 ps-2 pe-8 text-sm outline-hidden select-none data-active:bg-accent data-active:text-accent-foreground data-disabled:opacity-50";

function Indicator() {
  return (
    <Select.ItemIndicator class="pointer-events-none absolute inset-e-2 flex size-3.5 items-center justify-center data-unselected:hidden">
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
    </Select.ItemIndicator>
  );
}

export default function SelectExample() {
  return (
    <div class="grid w-48 gap-3">
      <label
        for="select-fruit-shadcn"
        class="text-sm leading-none font-medium select-none"
      >
        Fruit
      </label>
      <Select.Root name="fruit" defaultValue="apple">
        <Select.Trigger
          id="select-fruit-shadcn"
          class="flex h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 data-disabled:pointer-events-none data-disabled:opacity-50 dark:bg-input/30 dark:hover:bg-input/50 motion-reduce:transition-none"
        >
          <Select.Value
            class="truncate data-placeholder:text-muted-foreground"
            placeholder="Pick a fruit"
          />
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="size-4 shrink-0 opacity-50"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </Select.Trigger>
        <Select.Popup
          sideOffset={4}
          class="max-h-(--available-height) min-w-(--anchor-width) origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md transition-[opacity,scale] duration-150 data-closed:scale-95 data-closed:opacity-0 motion-reduce:transition-none starting:data-open:scale-95 starting:data-open:opacity-0"
        >
          <Select.Item class={item} value="apple">
            Apple
            <Indicator />
          </Select.Item>
          <Select.Item class={item} value="banana">
            Banana
            <Indicator />
          </Select.Item>
          <Select.Item class={item} value="cherry" disabled>
            Cherry
            <Indicator />
          </Select.Item>
          {/* A listbox holds only options and groups, so the separator is
              hidden from assistive technology. */}
          <div
            aria-hidden="true"
            class="pointer-events-none -mx-1 my-1 h-px bg-border"
          />
          <Select.Group>
            <Select.GroupLabel class="px-2 py-1.5 text-xs text-muted-foreground">
              Citrus
            </Select.GroupLabel>
            <Select.Item class={item} value="lemon">
              Lemon
              <Indicator />
            </Select.Item>
            <Select.Item class={item} value="orange">
              Orange
              <Indicator />
            </Select.Item>
          </Select.Group>
        </Select.Popup>
      </Select.Root>
    </div>
  );
}
