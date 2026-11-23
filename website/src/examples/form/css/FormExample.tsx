import { createSignal } from "solid-js";
import { Field } from "menhir/field";
import { Form } from "menhir/form";
import type { FormErrors } from "menhir/form";

import "./form.css";

export default function FormExample() {
  const [errors, setErrors] = createSignal<FormErrors>({});
  return (
    <Form
      class="form-example"
      errors={errors()}
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        // As a server would answer: the name is taken.
        setErrors(
          data.get("username") === "menhir"
            ? { username: "That name is taken." }
            : {},
        );
      }}
    >
      <Field.Root name="username" class="field">
        <Field.Label>Username</Field.Label>
        <Field.Control required class="control" />
        <Field.Description class="description">
          Try “menhir”, or leave it empty.
        </Field.Description>
        <Field.Error class="error" />
      </Field.Root>
      <button type="submit">Join</button>
    </Form>
  );
}
