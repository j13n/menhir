import { Field } from "@base-ui/react/field";

export default function FieldDemo() {
  // The default `validationMode` is "onSubmit", which never runs without a
  // form around the field; "onBlur" makes the error reachable on this page.
  return (
    <Field.Root validationMode="onBlur" className="stack">
      <Field.Label>Email</Field.Label>
      <Field.Control type="email" required />
      <Field.Description className="hint">
        We only use it for receipts.
      </Field.Description>
      <Field.Error className="error" />
    </Field.Root>
  );
}
