// Rendered on the server and hydrated in the test, so both sides get the
// same tree.
import { Field } from "../../src/field/index.ts";

export default function FieldFixture() {
  return (
    <form>
      <Field.Root name="email" data-testid="root">
        <Field.Label>Email</Field.Label>
        <Field.Control type="email" required />
        <Field.Description>For receipts.</Field.Description>
        <Field.Error data-testid="error" />
      </Field.Root>
      <button type="button">Next</button>
    </form>
  );
}
