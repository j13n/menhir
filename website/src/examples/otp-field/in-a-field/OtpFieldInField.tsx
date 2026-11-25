import { Field } from "menhir/field";
import { OtpField } from "menhir/otp-field";
import { Repeat } from "solid-js";

export default function OtpFieldInField() {
  return (
    <Field.Root name="code">
      <Field.Label>Code</Field.Label>
      <Field.Control
        required
        render={(p) => <OtpField.Root {...p} length={6} />}
      >
        <OtpField.Input />
        <Repeat count={6}>{(index) => <OtpField.Slot index={index} />}</Repeat>
      </Field.Control>
      <Field.Description>We sent it to your phone.</Field.Description>
      <Field.Error match="valueMissing">Enter the code.</Field.Error>
      <Field.Error match="patternMismatch">Enter all six digits.</Field.Error>
    </Field.Root>
  );
}
