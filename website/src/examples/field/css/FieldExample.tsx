import { Field } from "menhir/field";

import "./field.css";

export default function FieldExample() {
  return (
    <form class="field-example" onSubmit={(event) => event.preventDefault()}>
      <Field.Root name="email" class="field">
        <Field.Label>Email</Field.Label>
        <Field.Control type="email" required class="control" />
        <Field.Description class="description">
          We send the receipt here.
        </Field.Description>
        <Field.Error class="error" />
      </Field.Root>
      <button type="submit">Pay</button>
    </form>
  );
}
