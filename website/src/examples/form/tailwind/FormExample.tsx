import { createSignal } from "solid-js";
import { Field } from "menhir/field";
import { Form } from "menhir/form";
import type { FormErrors } from "menhir/form";

export default function FormExample() {
  const [errors, setErrors] = createSignal<FormErrors>({});
  return (
    <Form
      class="flex flex-col items-start gap-4"
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
      <Field.Root name="username" class="flex flex-col gap-1">
        <Field.Label class="text-sm font-medium">Username</Field.Label>
        <Field.Control
          required
          class="rounded-md border border-stone-300 px-3 py-1.5 data-invalid:border-red-600 dark:border-stone-700 dark:data-invalid:border-red-400"
        />
        <Field.Description class="text-sm text-stone-500 dark:text-stone-400">
          Try “menhir”, or leave it empty.
        </Field.Description>
        <Field.Error class="text-sm text-red-600 dark:text-red-400" />
      </Field.Root>
      <button
        type="submit"
        class="rounded-md bg-stone-800 px-3 py-1.5 text-sm font-medium text-white dark:bg-stone-300 dark:text-stone-900"
      >
        Join
      </button>
    </Form>
  );
}
