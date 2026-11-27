import { useState } from "react";

import { Button } from "@base-ui/react/button";
import { Field } from "@base-ui/react/field";
import { Form } from "@base-ui/react/form";

export default function FormDemo() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <>
      <Form className="stack" onFormSubmit={() => setSubmitted(true)}>
        <Field.Root name="name" className="stack">
          <Field.Label>Name</Field.Label>
          <Field.Control required />
          <Field.Error className="error" />
        </Field.Root>

        <Field.Root name="email" className="stack">
          <Field.Label>Email</Field.Label>
          <Field.Control type="email" required />
          <Field.Error className="error" />
        </Field.Root>

        <Button type="submit">Submit</Button>
      </Form>
      <p role="status">{submitted ? "Submitted" : null}</p>
    </>
  );
}
