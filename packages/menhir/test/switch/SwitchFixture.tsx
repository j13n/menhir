// Rendered on the server and hydrated in the test, so both sides get the
// same tree.
import { Switch } from "../../src/switch/index.ts";

export default function SwitchFixture() {
  return (
    <form>
      <label for="wifi">Wi-Fi</label>
      <Switch.Root id="wifi" name="wifi" defaultChecked>
        <Switch.Thumb data-testid="thumb" />
      </Switch.Root>
    </form>
  );
}
