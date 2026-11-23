// Rendered on the server and hydrated in the test, so both sides get the
// same tree.
import { Checkbox } from "../../src/checkbox/index.ts";
import { Field } from "../../src/field/index.ts";

export default function CheckboxFieldFixture() {
  return (
    <form>
      <Field.Root name="terms" data-testid="root">
        <Field.Control render={Checkbox.Root} required>
          <Checkbox.Indicator data-testid="indicator" />
        </Field.Control>
        <Field.Label>Accept terms</Field.Label>
        <Field.Description>Read them first.</Field.Description>
        <Field.Error data-testid="error" />
      </Field.Root>
      <button type="submit">Send</button>
    </form>
  );
}
