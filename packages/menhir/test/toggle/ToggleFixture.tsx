// Rendered on the server and hydrated in the test, so both sides get the
// same tree.
import { Toggle } from "../../src/toggle/index.ts";

export default function ToggleFixture() {
  return (
    <Toggle.Root id="bold" defaultPressed>
      Bold
    </Toggle.Root>
  );
}
