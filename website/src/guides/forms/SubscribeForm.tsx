import { formAction, useSubmissions } from "@solidjs/router";
import { Field } from "menhir/field";
import { Form } from "menhir/form";
import type { FormErrors } from "menhir/form";

// In an app, a server function ("use server") that validates and saves,
// and answers with its errors keyed by name.
const subscribe = formAction(async (form: FormData) => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  if (form.get("email") === "ada@example.com") {
    throw { errors: { email: "This address is subscribed already." } };
  }
});

export default function SubscribeForm() {
  const submissions = useSubmissions(subscribe);
  // The errors of the last submission, also after one made before the
  // page hydrated, which the server renders.
  const errors = (): FormErrors => submissions.at(-1)?.error?.errors ?? {};
  return (
    // The router sets aria-busy while it submits: style form[aria-busy].
    <Form method="post" action={subscribe} errors={errors()}>
      <Field.Root name="email">
        <Field.Label>Email</Field.Label>
        <Field.Control type="email" required />
        <Field.Error />
      </Field.Root>
      <button type="submit">Subscribe</button>
    </Form>
  );
}
