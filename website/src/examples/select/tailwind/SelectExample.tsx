import { Select } from "menhir/select";

const item =
  "flex cursor-default items-center gap-2 rounded px-2 py-1.5 select-none data-active:bg-stone-100 data-disabled:opacity-50 dark:data-active:bg-stone-800";
const indicator = "w-3 data-unselected:invisible";

export default function SelectExample() {
  return (
    <div class="flex flex-col gap-1.5 text-sm">
      <label for="select-fruit-tailwind">Fruit</label>
      <Select.Root name="fruit" defaultValue="apple">
        <Select.Trigger
          id="select-fruit-tailwind"
          class="flex min-w-40 cursor-pointer items-center justify-between gap-2 rounded-md border border-stone-300 px-3 py-1.5 after:content-['▾'] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500 dark:border-stone-600"
        >
          <Select.Value
            class="data-placeholder:opacity-60"
            placeholder="Pick a fruit"
          />
        </Select.Trigger>
        <Select.Popup
          sideOffset={4}
          class="m-0 max-h-(--available-height) min-w-(--anchor-width) origin-(--transform-origin) overflow-y-auto rounded-lg border border-stone-200 bg-white p-1 text-sm text-inherit shadow-lg transition-[opacity,scale] duration-100 data-closed:scale-95 data-closed:opacity-0 dark:border-stone-700 dark:bg-stone-900 starting:data-open:scale-95 starting:data-open:opacity-0"
        >
          <Select.Item class={item} value="apple">
            <Select.ItemIndicator class={indicator}>✓</Select.ItemIndicator>
            Apple
          </Select.Item>
          <Select.Item class={item} value="banana">
            <Select.ItemIndicator class={indicator}>✓</Select.ItemIndicator>
            Banana
          </Select.Item>
          <Select.Item class={item} value="cherry" disabled>
            <Select.ItemIndicator class={indicator}>✓</Select.ItemIndicator>
            Cherry
          </Select.Item>
          <Select.Group>
            <Select.GroupLabel class="px-2 pt-1.5 pb-1 pl-7 text-xs opacity-70">
              Citrus
            </Select.GroupLabel>
            <Select.Item class={item} value="lemon">
              <Select.ItemIndicator class={indicator}>✓</Select.ItemIndicator>
              Lemon
            </Select.Item>
            <Select.Item class={item} value="orange">
              <Select.ItemIndicator class={indicator}>✓</Select.ItemIndicator>
              Orange
            </Select.Item>
          </Select.Group>
        </Select.Popup>
      </Select.Root>
    </div>
  );
}
