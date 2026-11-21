import { Separator } from "menhir/separator";

export default function SeparatorExample() {
  return (
    <div class="w-64">
      <p>Unstyled, accessible UI primitives for SolidJS.</p>
      <Separator.Root class="my-3 h-px bg-stone-300 dark:bg-stone-700" />
      <div class="flex gap-3">
        <span>Docs</span>
        <Separator.Root
          orientation="vertical"
          class="w-px bg-stone-300 dark:bg-stone-700"
        />
        <span>Components</span>
        <Separator.Root
          orientation="vertical"
          class="w-px bg-stone-300 dark:bg-stone-700"
        />
        <span>Source</span>
      </div>
    </div>
  );
}
