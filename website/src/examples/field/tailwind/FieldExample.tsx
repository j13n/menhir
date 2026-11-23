import { Field } from "menhir/field";

export default function FieldExample() {
  return (
    <form
      class="flex flex-col items-start gap-4"
      onSubmit={(event) => event.preventDefault()}
    >
      <Field.Root name="email" class="flex flex-col gap-1">
        <Field.Label class="text-sm font-medium">Email</Field.Label>
        <Field.Control
          type="email"
          required
          class="rounded-md border border-stone-300 px-3 py-1.5 data-invalid:border-red-600 dark:border-stone-700 dark:data-invalid:border-red-400"
        />
        <Field.Description class="text-sm text-stone-500 dark:text-stone-400">
          We send the receipt here.
        </Field.Description>
        <Field.Error class="text-sm text-red-600 dark:text-red-400" />
      </Field.Root>
      <button
        type="submit"
        class="rounded-md bg-stone-800 px-3 py-1.5 text-sm font-medium text-white dark:bg-stone-300 dark:text-stone-900"
      >
        Pay
      </button>
    </form>
  );
}
