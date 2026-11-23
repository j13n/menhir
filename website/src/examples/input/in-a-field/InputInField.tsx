import { createSignal } from "solid-js";
import { Field } from "menhir/field";
import { Input } from "menhir/input";

export default function InputInField() {
  const [email, setEmail] = createSignal("");
  return (
    <Field.Root name="email">
      <Field.Label>Email</Field.Label>
      <Field.Control
        type="email"
        required
        render={(props) => (
          <Input.Root {...props} value={email()} onValueChange={setEmail} />
        )}
      />
      <Field.Description>We send the receipt here.</Field.Description>
      <Field.Error />
    </Field.Root>
  );
}
