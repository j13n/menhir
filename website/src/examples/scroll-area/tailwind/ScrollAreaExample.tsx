import { For } from "solid-js";
import { ScrollArea } from "menhir/scroll-area";

const releases = Array.from(
  { length: 24 },
  (_, index) => `Release 2.${24 - index}`,
);

// Fades at the top and bottom show where content is hidden.
const fades =
  "before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-6 before:rounded-t-lg before:bg-linear-to-b before:from-white before:opacity-0 before:transition-opacity data-overflow-y-start:before:opacity-100 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-6 after:rounded-b-lg after:bg-linear-to-t after:from-white after:opacity-0 after:transition-opacity data-overflow-y-end:after:opacity-100 dark:before:from-stone-900 dark:after:from-stone-900 motion-reduce:before:transition-none motion-reduce:after:transition-none";

export default function ScrollAreaExample() {
  return (
    <ScrollArea.Root
      class={`group relative h-48 w-56 rounded-lg border border-stone-200 bg-white text-sm dark:border-stone-700 dark:bg-stone-900 ${fades}`}
    >
      <ScrollArea.Viewport
        class="h-full overflow-auto overscroll-contain rounded-[inherit] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500"
        aria-label="Releases"
      >
        <ScrollArea.Content class="px-4 py-1">
          <For each={releases}>
            {(release) => <p class="my-3">{release}</p>}
          </For>
        </ScrollArea.Content>
      </ScrollArea.Viewport>
      {/* Shown on hover, where a pointer hovers, and while scrolling. */}
      <ScrollArea.Scrollbar class="absolute inset-y-1 end-1 z-10 w-1.5 opacity-0 transition-opacity delay-600 group-hover:opacity-100 group-hover:delay-0 data-scrolling:opacity-100 data-scrolling:delay-0 motion-reduce:transition-none">
        <ScrollArea.Thumb class="absolute inset-x-0 top-[calc((100%-max(var(--thumb-size),1.5rem))*var(--thumb-position))] h-[max(var(--thumb-size),1.5rem)] rounded-full bg-stone-400 dark:bg-stone-500" />
      </ScrollArea.Scrollbar>
    </ScrollArea.Root>
  );
}
