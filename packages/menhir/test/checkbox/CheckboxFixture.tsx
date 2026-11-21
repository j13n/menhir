// Rendered on the server and hydrated in the test, so both sides get the
// same tree.
import { Checkbox } from "../../src/checkbox/index.ts";

export default function CheckboxFixture() {
  return (
    <form>
      <label for="terms">Accept terms</label>
      <Checkbox.Root id="terms" name="terms" defaultChecked>
        <Checkbox.Indicator data-testid="indicator" />
      </Checkbox.Root>
      <Checkbox.Root aria-label="All options" name="all" indeterminate />
    </form>
  );
}
