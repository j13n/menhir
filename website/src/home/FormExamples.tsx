import { Checkbox } from "menhir/checkbox";
import { Field } from "menhir/field";
import { Form } from "menhir/form";
import type { FormErrors } from "menhir/form";
import { createSignal, For } from "solid-js";

import { ExampleCard, ExampleGroup } from "./ExampleGroup";

export default function FormExamples() {
  // The Fieldset's topics: at least one, an error from outside.
  const [chosenTopics, setChosenTopics] = createSignal(["Releases"]);
  // The Form's errors, as a server would answer: one name is taken.
  const [joinErrors, setJoinErrors] = createSignal<FormErrors>({});
  return (
    <ExampleGroup category="Forms">
      <ExampleCard name="Field" href="/docs/components/field">
        <Field.Root name="email" class="flex flex-col gap-1">
          <div class="flex items-center justify-between gap-4">
            <Field.Label>Email</Field.Label>
            <Field.Control
              type="email"
              required
              class="w-36 min-w-0 rounded-md border border-stone-300 bg-transparent px-3 py-1 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500 data-invalid:border-red-600 dark:border-stone-700 dark:data-invalid:border-red-400"
            />
          </div>
          <Field.Description class="text-sm opacity-70">
            Leave it empty to see the error.
          </Field.Description>
          <Field.Error class="text-sm text-red-600 dark:text-red-400" />
        </Field.Root>
      </ExampleCard>
      <ExampleCard name="Fieldset" href="/docs/components/field#fieldset">
        <Field.Root
          name="topics"
          error={
            chosenTopics().length === 0 ? "Choose at least one." : undefined
          }
        >
          <Field.Control
            render={(props) => (
              <fieldset {...props} class="flex flex-col gap-2" />
            )}
          >
            <legend class="mb-1">Email me about</legend>
            <For each={["Releases", "Events"]}>
              {(topic) => (
                <label class="flex items-center justify-between gap-4">
                  {topic}
                  <Checkbox.Root
                    name="topics"
                    value={topic}
                    checked={chosenTopics().includes(topic)}
                    onCheckedChange={(on) =>
                      setChosenTopics((list) =>
                        on ? [...list, topic] : list.filter((t) => t !== topic),
                      )
                    }
                    class="inline-flex size-6 shrink-0 items-center justify-center rounded-md border border-stone-400 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500 data-checked:border-transparent data-checked:bg-stone-800 dark:border-stone-500 dark:text-stone-900 dark:data-checked:bg-stone-300"
                  >
                    <Checkbox.Indicator class="hidden h-3 w-1.5 -translate-y-px rotate-45 border-r-2 border-b-2 border-current data-checked:block" />
                  </Checkbox.Root>
                </label>
              )}
            </For>
            <Field.Description class="text-sm opacity-70">
              Uncheck both to see the error.
            </Field.Description>
            <Field.Error class="text-sm text-red-600 dark:text-red-400" />
          </Field.Control>
        </Field.Root>
      </ExampleCard>
      <ExampleCard name="Form" href="/docs/components/form">
        <Form
          class="flex flex-col gap-2"
          errors={joinErrors()}
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            setJoinErrors(
              data.get("username") === "menhir"
                ? { username: "That name is taken." }
                : {},
            );
          }}
        >
          <Field.Root name="username" class="flex flex-col gap-1">
            <div class="flex items-center justify-between gap-4">
              <Field.Label>Username</Field.Label>
              <Field.Control
                required
                class="w-36 min-w-0 rounded-md border border-stone-300 bg-transparent px-3 py-1 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500 data-invalid:border-red-600 dark:border-stone-700 dark:data-invalid:border-red-400"
              />
            </div>
            <Field.Description class="text-sm opacity-70">
              Try “menhir”, or leave it empty.
            </Field.Description>
            <Field.Error class="text-sm text-red-600 dark:text-red-400" />
          </Field.Root>
          <button
            type="submit"
            class="self-end rounded-md bg-stone-800 px-3 py-1 text-sm font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500 dark:bg-stone-300 dark:text-stone-900"
          >
            Join
          </button>
        </Form>
      </ExampleCard>
    </ExampleGroup>
  );
}
