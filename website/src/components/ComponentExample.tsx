import type { JSX } from "@solidjs/web";
import { createMemo, createSignal, For, Show } from "solid-js";

import type { Highlighted } from "../highlight";
import { type LookName, looks, type Styling } from "../looks";
import CodeBlock from "./CodeBlock";
import Section from "./Section";

/** A source file of an example, highlighted. */
export type ExampleFile = { name: string; code: Highlighted };

/** One way of styling an example: what it renders and the files it is made of. */
export type ExampleVariant = {
  render: () => JSX.Element;
  /** The example's source, imported with `?highlight` so the code shown is the code that runs. */
  files: ExampleFile[];
};

/** A component's example, styled with Tailwind CSS and with plain CSS, and in each look that has one. */
export type ComponentExampleProps = {
  /** Shown with the site's Tailwind preflight, as in an app that uses Tailwind. */
  tailwind: ExampleVariant;
  /** Shown without the site's styles: only the example's own CSS applies. */
  css: ExampleVariant;
  /** Shown inside `data-look`, styled as the look is (src/looks/). */
  looks?: Partial<Record<LookName, ExampleVariant>>;
};

/** What the Styling radio group chooses between. */
type StylingChoice = Styling | LookName;

/** One choice of the Styling radio group. */
type StylingOption = {
  label: string;
  variant: ExampleVariant;
  styling: Styling;
  /** Set for a look, as the value of data-look around its example. */
  look?: LookName;
};

/** A look's option is chosen by the look's name, the other two by their styling. */
const choiceOf = (option: StylingOption): StylingChoice =>
  option.look ?? option.styling;

/**
 * The Example section: the live example with a choice of styling, Tailwind
 * CSS, plain CSS or one of the looks the component has an example in, beside
 * its heading, and the source of the chosen one. The choice is a native radio
 * group, so it has the radio group's keyboard behaviour without any script of
 * its own.
 */
export default function ComponentExample(props: ComponentExampleProps) {
  const options = createMemo<StylingOption[]>(() => [
    {
      label: "Tailwind CSS",
      variant: props.tailwind,
      styling: "tailwind",
    },
    { label: "CSS", variant: props.css, styling: "css" },
    ...looks.flatMap((look) => {
      const variant = props.looks?.[look.name];
      return variant
        ? [
            {
              label: look.label,
              variant,
              styling: look.styling,
              look: look.name,
            },
          ]
        : [];
    }),
  ]);
  const [chosen, setChosen] = createSignal<StylingChoice>("tailwind");
  const option = () =>
    options().find((option) => choiceOf(option) === chosen()) ?? options()[0]!;

  return (
    <Section
      id="example"
      title="Example"
      aside={
        <fieldset class="m-0 flex gap-3 border-0 p-0 text-sm">
          <legend class="sr-only">Styling</legend>
          <For each={options()}>
            {(item) => (
              <label class="cursor-pointer rounded-sm text-stone-500 hover:text-stone-950 has-checked:font-medium has-checked:text-stone-950 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-stone-500 dark:text-stone-400 dark:hover:text-white dark:has-checked:text-white">
                <input
                  type="radio"
                  name="example-styling"
                  value={choiceOf(item)}
                  class="sr-only"
                  checked={chosen() === choiceOf(item)}
                  onChange={() => setChosen(choiceOf(item))}
                />
                {item.label}
              </label>
            )}
          </For>
        </fieldset>
      }
    >
      <div class="flex justify-center rounded-lg border border-stone-200 p-10 dark:border-stone-800">
        <Show when={option()} keyed>
          {(shown) => (
            <div
              class={{ "unstyled-example": shown.styling === "css" }}
              data-look={shown.look}
            >
              {shown.variant.render()}
            </div>
          )}
        </Show>
      </div>
      <For each={option().variant.files}>
        {(file) => (
          <figure class="m-0 mt-4">
            <figcaption class="mb-1 font-mono text-xs text-stone-500 dark:text-stone-400">
              {file.name}
            </figcaption>
            <CodeBlock code={file.code} class="m-0" />
          </figure>
        )}
      </For>
    </Section>
  );
}
