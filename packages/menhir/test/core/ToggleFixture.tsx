// Rendered on the server and hydrated in createControllableSignal.hydrate.test.tsx.
import { createSignal } from "solid-js";

import { Toggle } from "./Toggle.tsx";

export default function ToggleFixture() {
  const [pressed, setPressed] = createSignal(true);
  return (
    <>
      <div data-testid="uncontrolled">
        <Toggle defaultPressed />
      </div>
      <div data-testid="controlled">
        <Toggle pressed={pressed()} onPressedChange={setPressed} />
      </div>
    </>
  );
}
