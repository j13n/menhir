import ColorSchemeToggle from "../examples/color-scheme/tailwind/ColorSchemeToggle";

const link =
  "text-sm font-medium text-stone-700 no-underline hover:text-stone-950 dark:text-stone-300 dark:hover:text-white";

/**
 * The site header: the name, home, the two sections of the site, a link to
 * the GitHub repository, and the color scheme toggle, which is the Color
 * Scheme page's example.
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
          <div class="flex items-center gap-1">
            <a
              href="https://github.com/j13n/menhir"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              title="GitHub"
              class="inline-flex size-9 items-center justify-center rounded-md text-stone-700 hover:bg-stone-200/60 hover:text-stone-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500 dark:text-stone-300 dark:hover:bg-stone-900 dark:hover:text-white"
            >
              {/* The GitHub mark. */}
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12 1C5.923 1 1 5.923 1 12c0 4.867 3.149 8.979 7.521 10.436.55.096.756-.233.756-.522 0-.262-.013-1.128-.013-2.049-2.764.509-3.479-.674-3.699-1.292-.124-.317-.66-1.293-1.127-1.554-.385-.207-.936-.715-.014-.729.866-.014 1.485.797 1.691 1.128.99 1.663 2.571 1.196 3.204.907.096-.715.385-1.196.701-1.471-2.448-.275-5.005-1.224-5.005-5.432 0-1.196.426-2.186 1.128-2.956-.111-.275-.496-1.402.11-2.915 0 0 .921-.288 3.024 1.128a10.193 10.193 0 0 1 2.75-.371c.936 0 1.871.123 2.75.371 2.104-1.43 3.025-1.128 3.025-1.128.605 1.513.221 2.64.111 2.915.701.77 1.127 1.747 1.127 2.956 0 4.222-2.571 5.157-5.019 5.432.399.344.743 1.004.743 2.035 0 1.471-.014 2.654-.014 3.025 0 .289.206.632.756.522C19.851 20.979 23 16.854 23 12c0-6.077-4.922-11-11-11Z" />
              </svg>
            </a>
            <ColorSchemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
