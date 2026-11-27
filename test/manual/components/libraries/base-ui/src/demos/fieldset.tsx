import { Field } from "@base-ui/react/field";
import { Fieldset } from "@base-ui/react/fieldset";

export default function FieldsetDemo() {
  return (
    <Fieldset.Root className="stack">
      <Fieldset.Legend>Address</Fieldset.Legend>

      <Field.Root className="stack">
        <Field.Label>Street</Field.Label>
        <Field.Control />
      </Field.Root>

      <Field.Root className="stack">
        <Field.Label>City</Field.Label>
        <Field.Control />
      </Field.Root>
    </Fieldset.Root>
  );
}
