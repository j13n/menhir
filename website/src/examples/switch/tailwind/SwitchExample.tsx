import { Switch } from "menhir/switch";

export default function SwitchExample() {
  return (
    <label class="inline-flex items-center gap-2">
      <Switch.Root
        name="wifi"
        defaultChecked
        class="h-6 w-11 cursor-pointer rounded-full bg-stone-300 p-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500 data-checked:bg-stone-800 dark:bg-stone-700 dark:data-checked:bg-stone-300"
      >
        <Switch.Thumb class="block size-5 rounded-full bg-white shadow-sm transition-transform data-checked:translate-x-5 motion-reduce:transition-none dark:data-checked:bg-stone-900" />
      </Switch.Root>
      Wi-Fi
    </label>
  );
}
