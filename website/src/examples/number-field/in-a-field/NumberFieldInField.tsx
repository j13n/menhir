import { Field } from "menhir/field";
import { NumberField } from "menhir/number-field";

export default function NumberFieldInField() {
  return (
    <Field.Root name="price">
      <Field.Label>Price</Field.Label>
      <Field.Control
        required
        render={(p) => (
          <NumberField.Root
            {...p}
            min={0}
            step={0.5}
            format={{ style: "currency", currency: "EUR" }}
            locale="de-DE"
          />
        )}
      >
        <NumberField.Input />
      </Field.Control>
      <Field.Description>In half euros.</Field.Description>
      <Field.Error />
    </Field.Root>
  );
}
