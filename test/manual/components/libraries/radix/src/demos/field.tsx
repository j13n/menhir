import { Form } from "radix-ui";

// Radix has no separate field: a field is `Form.Field` inside `Form.Root`.
// It has no description part, so the description is left out.
export default function FieldDemo() {
  return (
    <Form.Root onSubmit={(event) => event.preventDefault()}>
      <Form.Field name="email" className="stack">
        <Form.Label>Email</Form.Label>
        <Form.Control type="email" required />
        <Form.Message className="error" match="valueMissing" />
        <Form.Message className="error" match="typeMismatch" />
      </Form.Field>
    </Form.Root>
  );
}
