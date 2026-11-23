// Form with the app's own state: a store written through the draft, an
// action, and a schema run on submit. The test list and the cases left out
// are in README.md.
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";

import {
  For,
  action,
  createOptimistic,
  createSignal,
  createStore,
  snapshot,
} from "solid-js";

import { afterFlush, createRenderer, screen } from "#test-utils";

import type { FormErrors } from "../core/formContext.ts";
import { Field } from "../field/index.ts";
import { Input } from "../input/index.ts";
import { Form } from "./index.ts";
import { issuesToErrors } from "./standard-schema/index.ts";

const textbox = (name: string) => screen.getByRole("textbox", { name });
const button = (name: string) => screen.getByRole("button", { name });
const errorOf = (name: string) => screen.queryByTestId(`error-${name}`);

const schema = z.object({
  title: z.string().min(1, "Enter a title"),
  content: z.object({ year: z.string().regex(/^\d{4}$/, "Enter a year") }),
  sources: z.array(z.string().min(1, "Enter a link")),
});
type Entry = z.infer<typeof schema>;

/** A text Field whose value is the app's, through Input's controlled value. */
function StoreField(props: {
  name: string;
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  error?: string;
}) {
  return (
    <Field.Root name={props.name} error={props.error}>
      <Field.Label>{props.label}</Field.Label>
      <Field.Control
        render={(p) => (
          <Input.Root
            {...p}
            value={props.value}
            onValueChange={props.onValueChange}
          />
        )}
      />
      <Field.Error data-testid={`error-${props.name}`} />
    </Field.Root>
  );
}

/** An entry form on a store, saved through an action by `api`. */
function EntryForm(props: { api: (entry: Entry) => Promise<void> }) {
  const [entry, setEntry] = createStore<Entry>({
    title: "",
    content: { year: "" },
    sources: ["", ""],
  });
  const [errors, setErrors] = createSignal<FormErrors>({});
  const [saving, setSaving] = createOptimistic(false);
  const save = action(function* (values: Entry) {
    setSaving(true);
    yield props.api(values);
  });
  return (
    <Form
      errors={errors()}
      onSubmit={(event) => {
        event.preventDefault();
        const values = snapshot(entry);
        const result = schema.safeParse(values);
        if (result.success) {
          setErrors({});
          save(result.data);
        } else {
          setErrors(issuesToErrors(result.error.issues));
        }
      }}
    >
      <StoreField
        name="title"
        label="Title"
        value={entry.title}
        onValueChange={(value) =>
          setEntry((s) => {
            s.title = value;
          })
        }
        // Checked as the user types, shown once the field is touched.
        error={entry.title.length > 20 ? "Keep it short" : undefined}
      />
      <StoreField
        name="content.year"
        label="Year"
        value={entry.content.year}
        onValueChange={(value) =>
          setEntry((s) => {
            s.content.year = value;
          })
        }
      />
      {/* By index: a row keyed by its text would be made again on each edit. */}
      <For each={entry.sources} keyed={false}>
        {(source, i) => (
          <StoreField
            name={`sources.${i}`}
            label={`Source ${i + 1}`}
            value={source()}
            onValueChange={(value) =>
              setEntry((s) => {
                s.sources[i] = value;
              })
            }
          />
        )}
      </For>
      <button type="submit" aria-busy={saving() ? "true" : undefined}>
        Save
      </button>
    </Form>
  );
}

describe("<Form /> on the app's own state", () => {
  const { render } = createRenderer();

  it("shows a schema's issues under nested and array names, hides one once fixed, and saves valid values", async () => {
    const api = vi.fn(() => Promise.resolve());
    const { user } = await render(() => <EntryForm api={api} />);

    await user.click(button("Save"));
    await afterFlush();

    expect(api).not.toHaveBeenCalled();
    expect(errorOf("title")).toHaveTextContent("Enter a title");
    expect(errorOf("content.year")).toHaveTextContent("Enter a year");
    expect(errorOf("sources.0")).toHaveTextContent("Enter a link");
    expect(errorOf("sources.1")).toHaveTextContent("Enter a link");
    expect(textbox("Year")).toHaveAttribute("aria-invalid", "true");

    await user.type(textbox("Year"), "1999");
    await afterFlush();
    expect(errorOf("content.year")).not.toBeInTheDocument();
    expect(errorOf("title")).toBeInTheDocument();

    await user.type(textbox("Title"), "Menhirs");
    await user.type(textbox("Source 1"), "https://a.example");
    await user.type(textbox("Source 2"), "https://b.example");
    await user.click(button("Save"));
    await afterFlush();

    expect(api).toHaveBeenCalledWith({
      title: "Menhirs",
      content: { year: "1999" },
      sources: ["https://a.example", "https://b.example"],
    });
    for (const name of ["title", "content.year", "sources.0", "sources.1"]) {
      expect(errorOf(name)).not.toBeInTheDocument();
    }
  });

  it("shows an error checked as the user types once the field is touched", async () => {
    const { user } = await render(() => (
      <EntryForm api={() => Promise.resolve()} />
    ));

    await user.type(textbox("Title"), "A title much too long to keep");
    await afterFlush();
    expect(errorOf("title")).not.toBeInTheDocument();

    await user.tab();
    await afterFlush();
    expect(errorOf("title")).toHaveTextContent("Keep it short");
  });

  it("shows a pending flag set in the action on the submit button until it settles", async () => {
    let finish!: () => void;
    const api = () => new Promise<void>((resolve) => (finish = resolve));
    const { user } = await render(() => <EntryForm api={api} />);
    await user.type(textbox("Title"), "Menhirs");
    await user.type(textbox("Year"), "1999");
    await user.type(textbox("Source 1"), "https://a.example");
    await user.type(textbox("Source 2"), "https://b.example");

    await user.click(button("Save"));
    await afterFlush();
    expect(button("Save")).toHaveAttribute("aria-busy", "true");

    finish();
    await afterFlush();
    await afterFlush();
    expect(button("Save")).not.toHaveAttribute("aria-busy");
  });
});
