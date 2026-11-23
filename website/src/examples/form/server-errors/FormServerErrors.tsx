import { action, createOptimistic, createSignal } from "solid-js";
import { Field } from "menhir/field";
import { Form } from "menhir/form";
import type { FormErrors } from "menhir/form";

// Stands for your server, which answers with its errors keyed by name.
async function subscribe(data: FormData): Promise<FormErrors> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return data.get("email") === "ada@example.com"
    ? { email: "This address is subscribed already." }
    : {};
}

export default function FormServerErrors() {
  const [errors, setErrors] = createSignal<FormErrors>({});
  // True while the action runs; it reverts once the action settles.
  const [sending, setSending] = createOptimistic(false);
  const send = action(function* (data: FormData) {
    setSending(true);
    const answer: FormErrors = yield subscribe(data);
    setErrors(answer);
  });
  return (
    <Form
      errors={errors()}
      aria-busy={sending() ? "true" : undefined}
      onSubmit={(event) => {
        event.preventDefault();
        send(new FormData(event.currentTarget));
      }}
    >
      <Field.Root name="email">
        <Field.Label>Email</Field.Label>
        <Field.Control type="email" required />
        <Field.Description>Try ada@example.com.</Field.Description>
        <Field.Error />
      </Field.Root>
      <button type="submit">{sending() ? "Subscribing…" : "Subscribe"}</button>
    </Form>
  );
}
