import { Toggle } from "menhir/toggle";

export default function ToggleExample() {
  return (
    <Toggle.Root
      aria-label="Bold"
      class="size-9 cursor-pointer rounded-md border border-stone-300 font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500 data-pressed:border-transparent data-pressed:bg-stone-800 data-pressed:text-white dark:border-stone-700 dark:data-pressed:bg-stone-300 dark:data-pressed:text-stone-900"
    >
      B
    </Toggle.Root>
  );
}
