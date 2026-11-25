import { Separator } from "menhir/separator";
import { Toggle } from "menhir/toggle";
import { Toolbar } from "menhir/toolbar";

const item =
  "cursor-pointer rounded-md border border-stone-300 px-3 py-1 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500 data-disabled:cursor-default data-disabled:opacity-50 data-pressed:border-transparent data-pressed:bg-stone-800 data-pressed:text-white dark:border-stone-700 dark:data-pressed:bg-stone-300 dark:data-pressed:text-stone-900";

export default function ToolbarExample() {
  return (
    <Toolbar.Root
      aria-label="Text formatting"
      class="inline-flex items-center gap-1"
    >
      <Toolbar.Button render={Toggle.Root} class={item}>
        Bold
      </Toolbar.Button>
      <Toolbar.Button render={Toggle.Root} class={item}>
        Italic
      </Toolbar.Button>
      <Separator.Root
        orientation="vertical"
        class="mx-1 w-px self-stretch bg-stone-300 dark:bg-stone-700"
      />
      <Toolbar.Button disabled class={item}>
        Undo
      </Toolbar.Button>
      <Toolbar.Link href="#keyboard" class={item}>
        Help
      </Toolbar.Link>
    </Toolbar.Root>
  );
}
