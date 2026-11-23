// Rendered on the server and hydrated in the test, so both sides get the
// same tree. The errors stand for a server's answer to a submission made
// before hydration, read from the submission by the app.
import { Field } from "../../src/field/index.ts";
import { Form } from "../../src/form/index.ts";

export default function FormFixture() {
  return (
    <Form method="post" action="/subscribe" errors={{ email: "Taken" }}>
      <Field.Root name="email">
        <Field.Label>Email</Field.Label>
        <Field.Control type="email" required defaultValue="ada@example.com" />
        <Field.Error data-testid="error-email" />
      </Field.Root>
      <Field.Root name="city">
        <Field.Label>City</Field.Label>
        <Field.Control required />
        <Field.Error data-testid="error-city" />
      </Field.Root>
      <button type="submit">Subscribe</button>
    </Form>
  );
}
