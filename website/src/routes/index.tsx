import DisclosureExamples from "../home/DisclosureExamples";
import DisplayExamples from "../home/DisplayExamples";
import FormExamples from "../home/FormExamples";
import InputExamples from "../home/InputExamples";
import MenuExamples from "../home/MenuExamples";
import OverlayExamples from "../home/OverlayExamples";
import PickerExamples from "../home/PickerExamples";
import InstallCommand from "../components/InstallCommand";
import MenhirScene from "../components/MenhirScene";
import PageHead from "../components/PageHead";
import { homeStructuredData } from "../pageHead";
import { siteDescription, tagline } from "../site";

const approachItem =
  "rounded-xl border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900/60";
const approachNumber = "font-mono text-sm text-stone-500";

export default function Home() {
  return (
    <>
      <PageHead
        title={`Menhir · ${tagline}`}
        description={siteDescription}
        structuredData={homeStructuredData()}
      />
      <main class="max-w-none">
        <div class="grid items-center gap-6 md:grid-cols-[1fr_auto_1fr] md:gap-10">
          <h1 class="m-0 text-center text-6xl font-bold tracking-tight md:text-right md:text-7xl">
            Menhir
          </h1>
          <MenhirScene />
          <div class="text-center md:text-left">
            <p class="m-0 text-xl text-stone-600 dark:text-stone-400">
              {tagline}
            </p>
            <p class="mt-3 mb-0">
              <a href="/docs/getting-started" class="font-medium">
                Get started →
              </a>
            </p>
          </div>
        </div>

        <div class="mt-14 flex justify-center">
          <InstallCommand command="pnpm add menhir" />
        </div>

        <ol
          aria-label="Approach"
          class="mt-24 grid list-none gap-6 p-0 md:grid-cols-3"
        >
          <li class={approachItem}>
            <span class={approachNumber}>1</span>
            <h2 class="mt-1 mb-2 text-lg">Solid 2.0 idioms</h2>
            <p class="m-0">
              Written for Solid 2.0, not translated from React or Solid 1.x.
              Solid decides the API and the internals.
            </p>
          </li>
          <li class={approachItem}>
            <span class={approachNumber}>2</span>
            <h2 class="mt-1 mb-2 text-lg">WAI-ARIA</h2>
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
            <h2 class="mt-1 mb-2 text-lg">Size</h2>
            <p class="m-0">
              A component costs only what it uses. Every component's{" "}
              <a href="/docs/bundle-size">size</a> is published.
            </p>
          </li>
        </ol>

        <section aria-label="Examples" class="mt-24">
          <InputExamples />
          <FormExamples />
          <PickerExamples />
          <DisclosureExamples />
          <OverlayExamples />
          <MenuExamples />
          <DisplayExamples />
        </section>
      </main>

      <footer class="mt-24 border-t border-stone-200 pt-6 text-sm text-stone-500 dark:border-stone-800">
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
