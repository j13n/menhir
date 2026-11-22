import { Switch } from "menhir/switch";

export default function SwitchExample() {
  return (
    <label class="flex items-center gap-2 text-sm leading-none font-medium select-none">
      <Switch.Root
        name="wifi"
        defaultChecked
        class="inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 data-checked:bg-primary data-disabled:pointer-events-none data-disabled:opacity-50 data-unchecked:bg-input motion-reduce:transition-none dark:data-unchecked:bg-input/80"
      >
        <Switch.Thumb class="pointer-events-none block size-4 rounded-full bg-background ring-0 transition-transform data-checked:translate-x-[calc(100%-2px)] data-unchecked:translate-x-0 motion-reduce:transition-none dark:data-checked:bg-primary-foreground dark:data-unchecked:bg-foreground" />
      </Switch.Root>
      Wi-Fi
    </label>
  );
}
