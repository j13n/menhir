// Rendered on the server and hydrated in the test, so both sides get the
// same tree.
import { Field } from "../../src/field/index.ts";
import { Switch } from "../../src/switch/index.ts";

export default function SwitchFieldFixture() {
  return (
    <form>
      <Field.Root name="terms" data-testid="root">
        <Field.Label>Accept terms</Field.Label>
        <Field.Control render={Switch.Root} required>
          <Switch.Thumb data-testid="thumb" />
        </Field.Control>
        <Field.Description>Read them first.</Field.Description>
        <Field.Error data-testid="error" />
      </Field.Root>
      <button type="submit">Send</button>
    </form>
  );
}
