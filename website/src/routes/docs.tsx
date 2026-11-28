import { Collapsible } from "menhir/collapsible";
import { createSignal, type ParentProps } from "solid-js";

import DocsSidebar from "../components/DocsSidebar";

/**
 * The layout for every page in `docs/`: the docs navigation beside the page.
 * On narrow screens the navigation sits above the page, closed behind a
 * "Docs menu" button so the page starts near the top, and picking a link
 * closes it again; the router scrolls to the top on navigation, so the new
 * page is what shows. The page's `<main>` keeps its reading width but starts
 * at the left of its column instead of centring in it.
 */
export default function DocsLayout(props: ParentProps) {
  const [open, setOpen] = createSignal(false);
  return (
    <div class="md:grid md:grid-cols-[12rem_minmax(0,1fr)] md:gap-12 [&>main]:mx-0 [&>main]:min-w-0">
      <Collapsible.Root
        open={open()}
        onOpenChange={setOpen}
        render={(p) => <aside {...p} />}
        class="mb-8 md:sticky md:top-6 md:mb-0 md:self-start"
      >
        <Collapsible.Trigger class="group flex w-full items-center justify-between rounded-md border border-stone-300 px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-200/60 hover:text-stone-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500 md:hidden dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-900 dark:hover:text-white">
          Docs menu
          <svg
            class="size-4 transition-transform group-data-open:rotate-180"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            aria-hidden="true"
          >
            <path d="m4 6 4 4 4-4" />
          </svg>
        </Collapsible.Trigger>
        {/* Always shown from md up, so CSS hides it while closed, below md
            only, in place of the hidden attribute, which Tailwind's
            preflight hides with !important (Collapsible's README, "Shape"). */}
        <Collapsible.Panel
          hidden={false}
          class="mt-4 max-md:data-closed:hidden md:mt-0"
          onClick={(event) => {
            if ((event.target as Element).closest("a")) setOpen(false);
          }}
        >
          <DocsSidebar />
        </Collapsible.Panel>
      </Collapsible.Root>
      {props.children}
    </div>
  );
}
