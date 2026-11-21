import type { JSX } from "@solidjs/web";
import { createSignal, For, Show } from "solid-js";

import type { CodeFile } from "../componentDocs/types";
import Section from "./Section";

export type { CodeFile };

/** One way of styling an example: what it renders and the files it is made of. */
export type ExampleVariant = {
  render: () => JSX.Element;
  /** The example's source, imported with `?raw` so the code shown is the code that runs. */
  files: CodeFile[];
};

/** A component's example, styled with Tailwind CSS and with plain CSS. */
export type ComponentExampleProps = {
  /** Shown with the site's Tailwind preflight, as in an app that uses Tailwind. */
  tailwind: ExampleVariant;
  /** Shown without the site's styles: only the example's own CSS applies. */
  css: ExampleVariant;
};

type Styling = "tailwind" | "css";

const stylings: { value: Styling; label: string }[] = [
  { value: "tailwind", label: "Tailwind CSS" },
  { value: "css", label: "CSS" },
];

/**
 * The Example section: the live example with a choice of styling, Tailwind
 * CSS or plain CSS, beside its heading, and the source of the chosen one.
 * The choice is a native radio group, so it has the radio group's keyboard
 * behaviour without any script of its own.
 */
export default function ComponentExample(props: ComponentExampleProps) {
  const [styling, setStyling] = createSignal<Styling>("tailwind");

  return (
    <Section
      id="example"
      title="Example"
      aside={
        <fieldset class="m-0 flex gap-3 border-0 p-0 text-sm">
          <legend class="sr-only">Styling</legend>
          <For each={stylings}>
            {(option) => (
              <label class="cursor-pointer rounded-sm text-stone-500 hover:text-stone-950 has-checked:font-medium has-checked:text-stone-950 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-stone-500 dark:text-stone-400 dark:hover:text-white dark:has-checked:text-white">
                <input
                  type="radio"
                  name="example-styling"
                  value={option.value}
                  class="sr-only"
                  checked={styling() === option.value}
                  onChange={() => setStyling(option.value)}
                />
                {option.label}
              </label>
            )}
          </For>
        </fieldset>
      }
    >
      <div class="flex justify-center rounded-lg border border-stone-200 p-10 dark:border-stone-800">
        <Show
          when={styling() === "css"}
          fallback={<div>{props.tailwind.render()}</div>}
        >
          <div class="unstyled-example">{props.css.render()}</div>
        </Show>
      </div>
      <For each={props[styling()].files}>
        {(file) => (
          <figure class="m-0 mt-4">
            <figcaption class="mb-1 font-mono text-xs text-stone-500 dark:text-stone-400">
              {file.name}
            </figcaption>
            <pre class="m-0">
              <code>{file.code}</code>
            </pre>
          </figure>
        )}
      </For>
    </Section>
  );
}
