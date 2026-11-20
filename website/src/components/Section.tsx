import type { JSX } from "@solidjs/web";
import type { ParentProps } from "solid-js";

/**
 * A page section labelled by its own `<h2>`, so it is exposed as a named
 * region. `aside` is a control shown beside the heading, at its end.
 */
export default function Section(
  props: ParentProps<{ id: string; title: string; aside?: JSX.Element }>,
) {
  return (
    <section aria-labelledby={props.id}>
      <div class="mt-10 mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 id={props.id} class="m-0">
          {props.title}
        </h2>
        {props.aside}
      </div>
      {props.children}
    </section>
  );
}
