import { For, Show } from "solid-js";

type DocsLink = { href: string; title: string };
type DocsSection = { title?: string; links: DocsLink[] };

/**
 * The docs pages, grouped and in reading order. Add a page here when it lands
 * in `src/routes/docs/`, and a component's page under "Components".
 */
export const docsSections: DocsSection[] = [
  {
    links: [
      { href: "/docs/getting-started", title: "Getting started" },
      { href: "/docs/bundle-size", title: "Bundle size" },
      { href: "/docs/llms-txt", title: "llms.txt" },
    ],
  },
  {
    title: "Components",
    links: [
      { href: "/docs/components/checkbox", title: "Checkbox" },
      { href: "/docs/components/switch", title: "Switch" },
    ],
  },
];

const link =
  "block rounded px-3 py-1.5 text-stone-600 no-underline hover:bg-stone-200/60 hover:text-stone-950 aria-[current=page]:bg-stone-200/60 aria-[current=page]:font-medium aria-[current=page]:text-stone-950 dark:text-stone-400 dark:hover:bg-stone-900 dark:hover:text-white dark:aria-[current=page]:bg-stone-900 dark:aria-[current=page]:text-white";

/**
 * The navigation beside every docs page. A titled section is a list labelled
 * by its heading. The router marks the link to the current page with
 * `aria-current="page"`, which the styles select.
 */
export default function DocsSidebar() {
  return (
    <nav aria-label="Docs" class="flex flex-col gap-6 text-sm">
      <For each={docsSections}>
        {(section) => {
          // The sections are static, so the id is worked out once.
          const headingId = section.title
            ? `docs-sidebar-${section.title.toLowerCase()}`
            : undefined;
          return (
            <div>
              <Show when={section.title}>
                <h2
                  id={headingId}
                  class="m-0 mb-2 px-3 text-xs font-semibold tracking-wide text-stone-500 uppercase dark:text-stone-400"
                >
                  {section.title}
                </h2>
              </Show>
              <ul
                aria-labelledby={headingId}
                class="m-0 flex list-none flex-col gap-1 p-0"
              >
                <For each={section.links}>
                  {(page) => (
                    <li>
                      <a class={link} href={page.href}>
                        {page.title}
                      </a>
                    </li>
                  )}
                </For>
              </ul>
            </div>
          );
        }}
      </For>
    </nav>
  );
}
