import ColorModeToggle from "../examples/color-mode/tailwind/ColorModeToggle";

const link =
  "text-sm font-medium text-stone-700 no-underline hover:text-stone-950 dark:text-stone-300 dark:hover:text-white";

/**
 * The site header: the name, home, the two sections of the site, and the
 * color mode toggle, which is the Color Mode page's example.
 */
export default function NavBar() {
  return (
    <header class="px-6 py-4">
      <div class="mx-auto flex max-w-7xl items-center justify-between">
        <a
          class="flex items-center gap-2 text-lg font-semibold text-stone-900 no-underline dark:text-stone-100"
          href="/"
        >
          {/* The stone from public/favicon.svg, inline so it follows the
              site's theme rather than the system's. */}
          <svg class="size-6" viewBox="0 0 32 32" aria-hidden="true">
            <path
              class="fill-stone-600 dark:fill-stone-400"
              d="M6.5 31 7.8 17.5c.3-3.6 1.4-7 3.6-10.1L15.6 2c.9-1.1 2.4-1.2 3.4-.2l4.4 4.6c1.3 1.4 1.9 3.3 1.9 5.2L25.8 31Z"
            />
            <path
              class="fill-stone-400 dark:fill-stone-200"
              d="M6.5 31 7.8 17.5c.3-3.6 1.4-7 3.6-10.1L15.6 2c.9-1.1 2.4-1.2 3.4-.2-1.8 2.6-2.7 6-3 10L15.2 31Z"
            />
          </svg>
          Menhir
        </a>
        <div class="flex items-center gap-4">
          <nav aria-label="Site">
            <ul class="m-0 flex list-none gap-6 p-0">
              <li>
                <a class={link} href="/docs/getting-started">
                  Docs
                </a>
              </li>
              <li>
                <a class={link} href="/docs/components">
                  Components
                </a>
              </li>
            </ul>
          </nav>
          <ColorModeToggle />
        </div>
      </div>
    </header>
  );
}
