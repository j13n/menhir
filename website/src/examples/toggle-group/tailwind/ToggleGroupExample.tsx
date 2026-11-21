import { ToggleGroup } from "menhir/toggle-group";

const item =
  "cursor-pointer rounded-md border border-stone-300 px-3 py-1 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500 data-pressed:border-transparent data-pressed:bg-stone-800 data-pressed:text-white dark:border-stone-700 dark:data-pressed:bg-stone-300 dark:data-pressed:text-stone-900";

export default function ToggleGroupExample() {
  return (
    <ToggleGroup.Root
      aria-label="Text alignment"
      defaultValue={["left"]}
      class="inline-flex gap-1"
    >
      <ToggleGroup.Item value="left" class={item}>
        Left
      </ToggleGroup.Item>
      <ToggleGroup.Item value="center" class={item}>
        Center
      </ToggleGroup.Item>
      <ToggleGroup.Item value="right" class={item}>
        Right
      </ToggleGroup.Item>
    </ToggleGroup.Root>
  );
}
