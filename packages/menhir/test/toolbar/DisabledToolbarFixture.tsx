// A toolbar whose every item is disabled, through the Root: it stays one
// tab stop in the server HTML, on the first item.
import { Toolbar } from "../../src/toolbar/index.ts";

export default function DisabledToolbarFixture() {
  return (
    <Toolbar.Root aria-label="Edit" disabled>
      <Toolbar.Button>Cut</Toolbar.Button>
      <Toolbar.Button>Copy</Toolbar.Button>
    </Toolbar.Root>
  );
}
