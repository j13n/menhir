// The test list and the cases left out are in README.md: Field in a form,
// with a native <input>, <textarea> and <select> as controls.
import { createEffect } from "solid-js";
import { describe, expect, it, vi } from "vitest";

import { afterFlush, createRenderer, isJSDOM, screen } from "#test-utils";

import { Field } from "./index.ts";
import { useFieldRootContext } from "./root/FieldRootContext.ts";

function ContactForm(props: {
  onSubmit?: (data: FormData) => void;
  novalidate?: boolean;
  nameError?: string;
}) {
  return (
    <form
      novalidate={props.novalidate}
      onSubmit={(event) => {
        event.preventDefault();
        props.onSubmit?.(new FormData(event.currentTarget));
      }}
    >
      <Field.Root name="name" error={props.nameError} data-testid="name">
        <Field.Label>Name</Field.Label>
        <Field.Control />
        <Field.Error data-testid="name-error" />
      </Field.Root>
      <Field.Root name="email" data-testid="email">
        <Field.Label>Email</Field.Label>
        <Field.Control type="email" required />
        <Field.Error data-testid="email-error" />
      </Field.Root>
      <Field.Root name="message" data-testid="message">
        <Field.Label>Message</Field.Label>
        <Field.Control required render={(props) => <textarea {...props} />} />
        <Field.Error data-testid="message-error" />
      </Field.Root>
      <Field.Root name="topic" data-testid="topic">
        <Field.Label>Topic</Field.Label>
        <Field.Control
          required
          render={(props) => (
            <select {...props}>
              <option value="">Choose</option>
              <option value="sales">Sales</option>
            </select>
          )}
        />
        <Field.Error data-testid="topic-error" />
      </Field.Root>
      <button type="submit">Send</button>
      <button type="reset">Reset</button>
    </form>
  );
}

describe("Field in a form", () => {
  const { render } = createRenderer();
  const errorOf = (field: string) => screen.queryByTestId(`${field}-error`);

  async function fill(user: Awaited<ReturnType<typeof render>>["user"]) {
    await user.type(screen.getByRole("textbox", { name: "Email" }), "a@b.co");
    await user.type(screen.getByRole("textbox", { name: "Message" }), "Hi");
    await user.selectOptions(
      screen.getByRole("combobox", { name: "Topic" }),
      "sales",
    );
  }

  it("blocks a submission while a required input, textarea or select is empty, and shows their errors", async () => {
    const onSubmit = vi.fn();
    const { user } = await render(() => <ContactForm onSubmit={onSubmit} />);

    await user.click(screen.getByRole("button", { name: "Send" }));

    expect(onSubmit).not.toHaveBeenCalled();
    for (const field of ["email", "message", "topic"]) {
      expect(screen.getByTestId(field)).toHaveAttribute("data-invalid", "");
      expect(errorOf(field)).toBeInTheDocument();
    }
    expect(screen.getByTestId("name")).toHaveAttribute("data-touched", "");
    expect(errorOf("name")).toBeNull();
  });

  it("submits the values under each Field's name once filled", async () => {
    const onSubmit = vi.fn();
    const { user } = await render(() => <ContactForm onSubmit={onSubmit} />);
    await user.type(screen.getByRole("textbox", { name: "Name" }), "Ada");
    await fill(user);

    await user.click(screen.getByRole("button", { name: "Send" }));

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(Object.fromEntries(onSubmit.mock.calls[0][0])).toEqual({
      name: "Ada",
      email: "a@b.co",
      message: "Hi",
      topic: "sales",
    });
  });

  it("touches a valid Field with an error from outside when a blocked submission is attempted", async () => {
    const { user } = await render(() => <ContactForm nameError="Taken." />);
    expect(errorOf("name")).toBeNull();

    await user.click(screen.getByRole("button", { name: "Send" }));

    expect(errorOf("name")).toHaveTextContent("Taken.");
  });

  it("shows an error from outside after a submit with novalidate", async () => {
    const onSubmit = vi.fn();
    const { user } = await render(() => (
      <ContactForm novalidate nameError="Taken." onSubmit={onSubmit} />
    ));

    await user.click(screen.getByRole("button", { name: "Send" }));
    await afterFlush();

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(errorOf("name")).toHaveTextContent("Taken.");
    expect(errorOf("email")).toBeInTheDocument();
  });

  it("does not block a submission with an error from outside", async () => {
    const onSubmit = vi.fn();
    const { user } = await render(() => (
      <ContactForm nameError="Taken." onSubmit={onSubmit} />
    ));
    await fill(user);

    await user.click(screen.getByRole("button", { name: "Send" }));

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(errorOf("name")).toHaveTextContent("Taken.");
  });

  it("empties the controls on reset and hides the errors", async () => {
    const { user } = await render(() => <ContactForm nameError="Taken." />);
    await user.type(screen.getByRole("textbox", { name: "Email" }), "nope");
    await user.click(screen.getByRole("button", { name: "Send" }));
    expect(errorOf("email")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Reset" }));
    await afterFlush();

    expect(screen.getByRole("textbox", { name: "Email" })).toHaveValue("");
    for (const field of ["name", "email", "message", "topic"]) {
      expect(screen.getByTestId(field)).not.toHaveAttribute("data-touched");
      expect(screen.getByTestId(field)).not.toHaveAttribute("data-invalid");
      expect(errorOf(field)).toBeNull();
    }
  });

  it("keeps the errors when the app cancels the reset", async () => {
    const { user, container } = await render(() => <ContactForm />);
    container
      .querySelector("form")!
      .addEventListener("reset", (event) => event.preventDefault());
    await user.click(screen.getByRole("button", { name: "Send" }));
    expect(errorOf("email")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Reset" }));
    await afterFlush();

    expect(screen.getByTestId("email")).toHaveAttribute("data-touched", "");
    expect(errorOf("email")).toBeInTheDocument();
  });

  it("wakes no reader of a Field's state when a submission leaves its validity as it was", async () => {
    const runs = vi.fn();
    // Reads what an Error reads, and counts each time it is woken.
    function Reader() {
      const root = useFieldRootContext();
      createEffect(
        () => {
          runs();
          return [
            root.showsError(),
            root.message(),
            root.validity()?.valueMissing,
          ];
        },
        () => {},
      );
      return null;
    }
    const { user } = await render(() => (
      <form onSubmit={(event) => event.preventDefault()}>
        <Field.Root>
          <Field.Control required />
          <Reader />
        </Field.Root>
        <Field.Root>
          <Field.Control required />
        </Field.Root>
        <button type="submit">Send</button>
      </form>
    ));
    const send = screen.getByRole("button", { name: "Send" });
    await user.click(send);
    await afterFlush();
    const woken = runs.mock.calls.length;

    // Each blocked submission fires `invalid` at both controls, which the
    // Field hears on the form, and its own control's on the Root.
    await user.click(send);
    await user.click(send);
    await afterFlush();

    expect(runs).toHaveBeenCalledTimes(woken);
  });

  // jsdom focuses nothing when it blocks a submission.
  it.skipIf(isJSDOM)(
    "focuses the first invalid control on a blocked submission, which names its error",
    async () => {
      const { user } = await render(() => <ContactForm />);

      await user.click(screen.getByRole("button", { name: "Send" }));

      const email = screen.getByRole("textbox", { name: "Email" });
      expect(email).toHaveFocus();
      expect(email).toHaveAccessibleDescription(
        (email as HTMLInputElement).validationMessage,
      );
    },
  );
});
