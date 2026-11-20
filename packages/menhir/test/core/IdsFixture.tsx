// Rendered on the server and hydrated in ids.hydrate.test.tsx. A part links
// its elements with Solid's createUniqueId; a consumer's `id` replaces it.
import { createUniqueId } from "solid-js";

function Field(props: { id?: string; label: string }) {
  const generated = createUniqueId();
  const id = () => props.id ?? generated;
  return (
    <div>
      <label for={id()}>{props.label}</label>
      <input id={id()} />
    </div>
  );
}

export default function IdsFixture() {
  return (
    <>
      <Field label="First" />
      <Field label="Second" />
      <Field id="chosen" label="Third" />
      <Field label="Fourth" />
    </>
  );
}
