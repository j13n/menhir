import { Field } from "menhir/field";
import { Switch } from "menhir/switch";

export default function SwitchInField() {
  return (
    <Field.Root name="terms">
      <Field.Label>Accept the terms</Field.Label>
      <Field.Control render={Switch.Root} required>
        <Switch.Thumb />
      </Field.Control>
      <Field.Description>You can read them on the next page.</Field.Description>
      <Field.Error match="valueMissing">Turn this on to go on.</Field.Error>
    </Field.Root>
  );
}
