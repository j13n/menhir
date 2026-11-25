// Rendered on the server and hydrated in the test, so both sides get the
// same tree. The first item is disabled, so the tab stop is the second.
import { Toggle } from "../../src/toggle/index.ts";
import { Toolbar } from "../../src/toolbar/index.ts";

export default function ToolbarFixture() {
  return (
    <Toolbar.Root aria-label="Formatting">
      <Toolbar.Button disabled>Cut</Toolbar.Button>
      <Toolbar.Button render={Toggle.Root}>Bold</Toolbar.Button>
      <Toolbar.Link href="#help">Help</Toolbar.Link>
      <Toolbar.Input aria-label="Font" value="Serif" />
    </Toolbar.Root>
  );
}
