// Rendered on the server and hydrated in the test, so both sides get the
// same tree.
import { createSignal } from "solid-js";

import { Separator } from "../../src/separator/index.ts";

export default function SeparatorFixture() {
  const [vertical, setVertical] = createSignal(true);
  return (
    <>
      <Separator.Root id="sections" />
      <Separator.Root
        id="side-by-side"
        orientation={vertical() ? "vertical" : "horizontal"}
      />
      <button type="button" onClick={() => setVertical(false)}>
        Stack
      </button>
    </>
  );
}
