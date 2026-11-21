import { Switch } from "menhir/switch";

import InstallCommand from "../components/InstallCommand";
import MenhirScene from "../components/MenhirScene";

const approachItem =
  "rounded-xl border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900/60";
const approachNumber = "font-mono text-sm text-stone-500";

export default function Home() {
  return (
    <>
      <main class="max-w-none">
        <div class="grid items-center gap-6 md:grid-cols-[1fr_auto_1fr] md:gap-10">
          <h1 class="m-0 text-center text-6xl font-bold tracking-tight md:text-right md:text-7xl">
            Menhir
          </h1>
          <MenhirScene />
          <div class="text-center md:text-left">
            <p class="m-0 text-xl text-stone-600 dark:text-stone-400">
              Unstyled, accessible UI primitives for SolidJS
            </p>
            <p class="mt-3 mb-0">
              <a href="/docs/getting-started" class="font-medium">
                Get started →
              </a>
            </p>
          </div>
        </div>

        <div class="mt-12 flex justify-center">
          <InstallCommand command="pnpm add menhir" />
        </div>

        <ol
          aria-label="Approach"
          class="mt-16 grid list-none gap-4 p-0 md:grid-cols-3"
        >
          <li class={approachItem}>
            <span class={approachNumber}>1</span>
            <h3 class="mt-1">Solid 2.0 idioms</h3>
            <p class="m-0">
              Written for Solid 2.0, not translated from React or Solid 1.x.
              Solid decides the API and the internals.
            </p>
          </li>
          <li class={approachItem}>
            <span class={approachNumber}>2</span>
            <h3 class="mt-1">WAI-ARIA</h3>
            <p class="m-0">
              Each component follows its{" "}
              <a href="https://www.w3.org/WAI/ARIA/apg/patterns/">
                WAI-ARIA Authoring Practices
              </a>{" "}
              pattern for roles, states and keyboard behaviour.
            </p>
          </li>
          <li class={approachItem}>
            <span class={approachNumber}>3</span>
            <h3 class="mt-1">Size</h3>
            <p class="m-0">
              A component costs only what it uses. Every entry point has a{" "}
              <a href="/docs/components">size budget</a> that CI enforces.
            </p>
          </li>
        </ol>

        <section aria-label="Examples" class="mt-16">
          <div class="flex flex-wrap justify-center gap-6">
            <figure class="m-0 flex w-64 flex-col gap-6 rounded-xl border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900/60">
              <label class="flex items-center justify-between gap-4">
                Airplane mode
                <Switch.Root class="inline-flex h-7 w-12 shrink-0 items-center rounded-full bg-stone-300 p-1 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500 data-checked:bg-stone-800 dark:bg-stone-700 dark:data-checked:bg-stone-300">
                  <Switch.Thumb class="block size-5 rounded-full bg-white shadow transition-transform data-checked:translate-x-5 dark:data-checked:bg-stone-900" />
                </Switch.Root>
              </label>
              <figcaption class="text-sm">
                <a href="/docs/components/switch">Switch</a>
              </figcaption>
            </figure>
          </div>
        </section>
      </main>

      <footer class="mt-16 border-t border-stone-200 pt-6 text-sm text-stone-500 dark:border-stone-800">
        <p class="m-0">
          Menhir draws inspiration from{" "}
          <a href="https://base-ui.com">Base UI</a>,{" "}
          <a href="https://www.radix-ui.com">Radix</a>, and the Solid UI
          libraries <a href="https://kobalte.dev">Kobalte</a> and{" "}
          <a href="https://corvu.dev">corvu</a>. Thanks to their authors.
        </p>
      </footer>
    </>
  );
}
