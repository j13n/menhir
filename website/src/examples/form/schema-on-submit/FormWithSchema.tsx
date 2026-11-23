import { createSignal } from "solid-js";
import { Field } from "menhir/field";
import { Form } from "menhir/form";
import type { FormErrors } from "menhir/form";
import { issuesToErrors } from "menhir/form/standard-schema";
import type { Issue } from "menhir/form/standard-schema";

type SignUp = { email: string; password: string; confirm: string };

// Any schema library that implements Standard Schema fits here. This schema
// is written by hand, so that the example depends on none.
const signUpSchema = {
  "~standard": {
    version: 1,
    vendor: "example",
    validate(value: SignUp) {
      const issues: Issue[] = [];
      if (value.password.length < 8) {
        issues.push({
          message: "Use 8 characters or more.",
          path: ["password"],
        });
      }
      if (value.confirm !== value.password) {
        issues.push({ message: "The passwords differ.", path: ["confirm"] });
      }
      return issues.length > 0 ? { issues } : { value };
    },
  },
} as const;

export default function FormWithSchema() {
  const [errors, setErrors] = createSignal<FormErrors>({});
  // A schema may answer at once or later, so its answer is awaited.
  async function validate(values: SignUp) {
    const result = await signUpSchema["~standard"].validate(values);
    setErrors(result.issues ? issuesToErrors(result.issues) : {});
    if (!result.issues) {
      // Send result.value to your server.
    }
  }
  return (
    <Form
      errors={errors()}
      onSubmit={(event) => {
        event.preventDefault();
        void validate(
          Object.fromEntries(new FormData(event.currentTarget)) as SignUp,
        );
      }}
    >
      <Field.Root name="email">
        <Field.Label>Email</Field.Label>
        <Field.Control type="email" required />
        <Field.Error />
      </Field.Root>
      <Field.Root name="password">
        <Field.Label>Password</Field.Label>
        <Field.Control type="password" required />
        <Field.Error />
      </Field.Root>
      <Field.Root name="confirm">
        <Field.Label>Password again</Field.Label>
        <Field.Control type="password" required />
        <Field.Error />
      </Field.Root>
      <button type="submit">Sign up</button>
    </Form>
  );
}
