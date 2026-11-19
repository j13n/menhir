import type { ParentProps } from "solid-js";

/** A page section labelled by its own `<h2>`, so it is exposed as a named region. */
export default function Section(
  props: ParentProps<{ id: string; title: string }>,
) {
  return (
    <section aria-labelledby={props.id}>
      <h2 id={props.id}>{props.title}</h2>
      {props.children}
    </section>
  );
}
