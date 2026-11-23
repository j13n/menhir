import { createSignal } from "solid-js";
import { Checkbox } from "menhir/checkbox";
import { Field } from "menhir/field";

export default function CheckboxInField() {
  const [accepted, setAccepted] = createSignal(false);
  return (
    <Field.Root name="terms">
      <Field.Control
        required
        render={(props) => (
          <Checkbox.Root
            {...props}
            checked={accepted()}
            onCheckedChange={setAccepted}
          />
        )}
      >
        <Checkbox.Indicator />
      </Field.Control>
      <Field.Label>Accept the terms</Field.Label>
      <Field.Description>You can read them on the next page.</Field.Description>
      <Field.Error match="valueMissing">Check this to go on.</Field.Error>
    </Field.Root>
  );
}
