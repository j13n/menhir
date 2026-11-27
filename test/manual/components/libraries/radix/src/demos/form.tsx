import { Form } from "radix-ui";
import { useState } from "react";

export default function FormDemo() {
  const [submitted, setSubmitted] = useState(false);
  return (
    <>
      <Form.Root
        className="stack"
        onSubmit={(event) => {
          event.preventDefault();
          setSubmitted(true);
        }}
      >
        <Form.Field name="name" className="stack">
          <Form.Label>Name</Form.Label>
          <Form.Control type="text" required />
          <Form.Message className="error" match="valueMissing" />
        </Form.Field>
        <Form.Field name="email" className="stack">
          <Form.Label>Email</Form.Label>
          <Form.Control type="email" required />
          <Form.Message className="error" match="valueMissing" />
          <Form.Message className="error" match="typeMismatch" />
        </Form.Field>
        <Form.Submit>Submit</Form.Submit>
      </Form.Root>
      <p role="status">{submitted ? "Submitted" : null}</p>
    </>
  );
}
