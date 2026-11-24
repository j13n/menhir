import type { JSX } from "@solidjs/web";

import { categoryId } from "../componentDocs/categories";
import type { ComponentCategory } from "../componentDocs/categories";

/**
 * A category of the home page's examples: a region named by its heading,
 * with the cards in a grid.
 */
export function ExampleGroup(props: {
  category: ComponentCategory;
  children: JSX.Element;
}) {
  return (
    <section
      aria-labelledby={`examples-${categoryId(props.category)}`}
      class="mt-16 first:mt-0"
    >
      <h2
        id={`examples-${categoryId(props.category)}`}
        class="mt-0 mb-4 text-lg"
      >
        {props.category}
      </h2>
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {props.children}
      </div>
    </section>
  );
}

/**
 * One component at work, captioned with a link to its page. The caption sits
 * at the bottom, so captions line up along each row.
 */
export function ExampleCard(props: {
  name: string;
  href: string;
  children: JSX.Element;
}) {
  return (
    <figure class="m-0 flex flex-col justify-between gap-6 rounded-xl border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900/60">
      {props.children}
      <figcaption class="text-sm">
        <a href={props.href}>{props.name}</a>
      </figcaption>
    </figure>
  );
}
