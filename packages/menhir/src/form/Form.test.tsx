// The test list and the cases left out are in README.md.
import { afterEach, describe, expect, it, vi } from "vitest";

import { createSignal, flush } from "solid-js";

import {
  afterFlush,
  afterReset,
  createRenderer,
  describeConformance,
  fireEvent,
  isJSDOM,
  screen,
} from "#test-utils";

import { centerOf, press } from "../../test/floating/input.ts";

import { Checkbox } from "../checkbox/index.ts";
import type { FormErrors } from "../core/formContext.ts";
import { Field } from "../field/index.ts";
import { Select } from "../select/index.ts";
import { Switch } from "../switch/index.ts";
import { Form } from "./index.ts";
import type { FormProps } from "./index.ts";

const form = () => screen.getByTestId<HTMLFormElement>("form");
const textbox = (name: string) => screen.getByRole("textbox", { name });
const button = (name: string) => screen.getByRole("button", { name });
const errorOf = (name: string) => screen.queryByTestId(`error-${name}`);

/** A text Field with a Label, a Control and an Error. */
function TextField(props: {
  name: string;
  label: string;
  required?: boolean;
  type?: string;
  defaultValue?: string;
  error?: string;
}) {
  return (
    <Field.Root name={props.name} error={props.error}>
      <Field.Label>{props.label}</Field.Label>
      <Field.Control
        type={props.type}
        required={props.required}
        defaultValue={props.defaultValue}
      />
      <Field.Error data-testid={`error-${props.name}`} />
    </Field.Root>
  );
}

// The suite's props are typed for any element; Form's ref, for a form.
describeConformance("<Form />", (props) => <Form {...(props as FormProps)} />, {
  tagName: "FORM",
});

describe("<Form />", () => {
  const { render } = createRenderer();
  afterEach(() => vi.restoreAllMocks());

  it("renders a <form> with the consumer's attributes", async () => {
    await render(() => (
      <Form data-testid="form" method="post" action="/save" aria-busy="true" />
    ));

    expect(form().tagName).toBe("FORM");
    expect(form()).toHaveAttribute("method", "post");
    expect(form()).toHaveAttribute("action", "/save");
    expect(form()).toHaveAttribute("aria-busy", "true");
  });

  it("sets novalidate once mounted", async () => {
    await render(() => <Form data-testid="form" />);

    expect(form()).toHaveAttribute("novalidate");
  });

  it("calls onSubmit with the submit event of a valid submission, and does not cancel it", async () => {
    const onSubmit = vi.fn((event: SubmitEvent) => event.defaultPrevented);
    // Cancelled after Form, so the test page does not navigate.
    const cancel = (event: Event) => event.preventDefault();
    document.addEventListener("submit", cancel);
    const { user } = await render(() => (
      <Form data-testid="form" onSubmit={onSubmit}>
        <TextField name="email" label="Email" required defaultValue="a@b.c" />
        <button type="submit">Send</button>
      </Form>
    ));

    await user.click(button("Send"));
    document.removeEventListener("submit", cancel);

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit.mock.calls[0]![0]).toBeInstanceOf(Event);
    expect(onSubmit.mock.results[0]!.value).toBe(false);
  });

  it("blocks an invalid submission: cancels it, does not call onSubmit, and shows the invalid Fields' errors", async () => {
    const onSubmit = vi.fn();
    const reached = vi.fn((event: Event) => event.defaultPrevented);
    document.addEventListener("submit", reached);
    const { user } = await render(() => (
      <Form data-testid="form" onSubmit={onSubmit}>
        <TextField name="name" label="Name" defaultValue="Ada" />
        <TextField name="email" label="Email" required />
        <button type="submit">Send</button>
      </Form>
    ));

    await user.click(button("Send"));
    await afterFlush();
    document.removeEventListener("submit", reached);

    expect(onSubmit).not.toHaveBeenCalled();
    expect(reached.mock.results.map((r) => r.value)).toEqual([true]);
    expect(textbox("Email")).toHaveAttribute("aria-invalid", "true");
    expect(errorOf("email")).toBeInTheDocument();
    expect(textbox("Name")).not.toHaveAttribute("aria-invalid");
    expect(errorOf("name")).not.toBeInTheDocument();
  });

  it("lets a router's document listener, which checks defaultPrevented, act on a valid submission only", async () => {
    // As Solid's router intercepts a form action's submission.
    const routed = vi.fn();
    const router = (event: Event) => {
      if (event.defaultPrevented) return;
      event.preventDefault();
      routed();
    };
    document.addEventListener("submit", router);
    const { user } = await render(() => (
      <Form data-testid="form" method="post" action="/save">
        <TextField name="email" label="Email" required />
        <button type="submit">Send</button>
      </Form>
    ));

    await user.click(button("Send"));
    expect(routed).not.toHaveBeenCalled();

    await user.type(textbox("Email"), "a@b.c");
    await user.click(button("Send"));
    document.removeEventListener("submit", router);

    expect(routed).toHaveBeenCalledOnce();
  });

  it("submits an invalid form from a submit button with formnovalidate", async () => {
    const onSubmit = vi.fn((event: SubmitEvent) => event.preventDefault());
    const { user } = await render(() => (
      <Form data-testid="form" onSubmit={onSubmit}>
        <TextField name="email" label="Email" required />
        <button type="submit" formnovalidate>
          Save draft
        </button>
      </Form>
    ));

    await user.click(button("Save draft"));

    expect(onSubmit).toHaveBeenCalledOnce();
  });

  describe("focuses the first invalid control of a blocked submission", () => {
    it("a text input, in tree order", async () => {
      const { user } = await render(() => (
        <Form data-testid="form">
          <TextField name="name" label="Name" defaultValue="Ada" />
          <TextField name="email" label="Email" required />
          <TextField name="city" label="City" required />
          <button type="submit">Send</button>
        </Form>
      ));

      await user.click(button("Send"));

      expect(textbox("Email")).toHaveFocus();
    });

    it("a Switch's button", async () => {
      const { user } = await render(() => (
        <Form data-testid="form">
          <Field.Root name="terms">
            <Field.Label>Accept terms</Field.Label>
            <Field.Control render={Switch.Root} required />
          </Field.Root>
          <button type="submit">Send</button>
        </Form>
      ));

      await user.click(button("Send"));

      expect(
        screen.getByRole("switch", { name: "Accept terms" }),
      ).toHaveFocus();
    });

    it("a Checkbox's button", async () => {
      const { user } = await render(() => (
        <Form data-testid="form">
          <Field.Root name="terms">
            <Field.Label>Accept terms</Field.Label>
            <Field.Control render={Checkbox.Root} required />
          </Field.Root>
          <button type="submit">Send</button>
        </Form>
      ));

      await user.click(button("Send"));

      expect(
        screen.getByRole("checkbox", { name: "Accept terms" }),
      ).toHaveFocus();
    });

    it("a Select's Trigger", async () => {
      const { user } = await render(() => (
        <Form data-testid="form">
          <Field.Root>
            <Field.Label>Fruit</Field.Label>
            <Select.Root name="fruit" required>
              <Field.Control render={Select.Trigger}>
                <Select.Value placeholder="Pick one" />
              </Field.Control>
              <Select.Popup>
                <Select.Item value="apple">Apple</Select.Item>
              </Select.Popup>
            </Select.Root>
          </Field.Root>
          <button type="submit">Send</button>
        </Form>
      ));

      await user.click(button("Send"));

      expect(screen.getByRole("combobox", { name: "Fruit" })).toHaveFocus();
    });
  });

  describe("errors", () => {
    it("shows each in the Field of that name at once, a nested key too", async () => {
      await render(() => (
        <Form
          data-testid="form"
          errors={{ email: "Taken", "content.year": "Enter a year" }}
        >
          <TextField name="email" label="Email" />
          <TextField name="content.year" label="Year" />
          <TextField name="city" label="City" />
        </Form>
      ));

      expect(textbox("Email")).toHaveAttribute("aria-invalid", "true");
      expect(errorOf("email")).toHaveTextContent("Taken");
      expect(textbox("Email")).toHaveAccessibleDescription("Taken");
      expect(errorOf("content.year")).toHaveTextContent("Enter a year");
      expect(textbox("City")).not.toHaveAttribute("aria-invalid");
      expect(errorOf("city")).not.toBeInTheDocument();
    });

    it("does not block a submission", async () => {
      const onSubmit = vi.fn((event: SubmitEvent) => event.preventDefault());
      const { user } = await render(() => (
        <Form
          data-testid="form"
          errors={{ email: "Taken" }}
          onSubmit={onSubmit}
        >
          <TextField name="email" label="Email" defaultValue="a@b.c" />
          <button type="submit">Send</button>
        </Form>
      ));

      await user.click(button("Send"));

      expect(onSubmit).toHaveBeenCalledOnce();
    });

    it("hides one on its control's next edit, keeps the others, and shows them again with a new errors object", async () => {
      const [errors, setErrors] = createSignal<FormErrors>({
        email: "Taken",
        city: "Unknown",
      });
      const { user } = await render(() => (
        <Form data-testid="form" errors={errors()}>
          <TextField name="email" label="Email" />
          <TextField name="city" label="City" />
          <Field.Root name="terms">
            <Field.Label>Accept terms</Field.Label>
            <Field.Control render={Checkbox.Root} />
            <Field.Error data-testid="error-terms" />
          </Field.Root>
        </Form>
      ));

      await user.type(textbox("Email"), "x");
      await afterFlush();

      expect(errorOf("email")).not.toBeInTheDocument();
      expect(textbox("Email")).not.toHaveAttribute("aria-invalid");
      expect(errorOf("city")).toHaveTextContent("Unknown");

      setErrors({ email: "Still taken", city: "Unknown", terms: "Accept" });
      flush();
      expect(errorOf("email")).toHaveTextContent("Still taken");
      expect(errorOf("terms")).toHaveTextContent("Accept");

      // A Menhir control's change comes from its hidden input.
      await user.click(screen.getByRole("checkbox", { name: "Accept terms" }));
      await afterFlush();
      expect(errorOf("terms")).not.toBeInTheDocument();
    });

    it("hides only the errors the edit was made against, not new ones passed in the same update", async () => {
      const [errors, setErrors] = createSignal<FormErrors>({ email: "Taken" });
      await render(() => (
        <Form data-testid="form" errors={errors()}>
          <TextField name="email" label="Email" />
        </Form>
      ));

      // An edit, then a submission's answer, before either has flushed.
      fireEvent.input(textbox("Email"));
      setErrors({ email: "Still taken" });
      await afterFlush();

      expect(errorOf("email")).toHaveTextContent("Still taken");
    });

    it("hides an error passed as an object written inline, until its message changes", async () => {
      const [message, setMessage] = createSignal("Taken");
      const { user } = await render(() => (
        <Form data-testid="form" errors={{ email: message() }}>
          <TextField name="email" label="Email" />
        </Form>
      ));

      await user.type(textbox("Email"), "x");
      await afterFlush();
      expect(errorOf("email")).not.toBeInTheDocument();

      setMessage("Still taken");
      await afterFlush();
      expect(errorOf("email")).toHaveTextContent("Still taken");
    });

    it("shows its own error over a Field's own error until the Field is touched", async () => {
      await render(() => (
        <Form data-testid="form" errors={{ email: "Taken" }}>
          <TextField name="email" label="Email" error="Too short" />
        </Form>
      ));

      expect(errorOf("email")).toHaveTextContent("Taken");
      fireEvent.focusOut(textbox("Email"), { relatedTarget: document.body });
      await afterFlush();
      expect(errorOf("email")).toHaveTextContent("Too short");
    });

    it("is read by no Field outside a Form", async () => {
      await render(() => (
        <>
          <Form data-testid="form" errors={{ email: "Taken" }} />
          <TextField name="email" label="Email" />
        </>
      ));

      expect(textbox("Email")).not.toHaveAttribute("aria-invalid");
    });
  });

  describe("reset", () => {
    it("puts the controls back, and hides the errors from outside and the browser's", async () => {
      const { user } = await render(() => (
        <Form data-testid="form" errors={{ zip: "Unknown" }}>
          <TextField name="email" label="Email" required />
          <TextField name="city" label="City" defaultValue="Oslo" />
          <TextField name="zip" label="Zip" />
          <button type="submit">Send</button>
          <button type="reset">Reset</button>
        </Form>
      ));
      await user.type(textbox("City"), "!");
      await user.click(button("Send"));
      await afterFlush();
      expect(errorOf("email")).toBeInTheDocument();
      expect(errorOf("zip")).toBeInTheDocument();

      await user.click(button("Reset"));
      await afterReset();

      expect(textbox("City")).toHaveValue("Oslo");
      expect(errorOf("email")).not.toBeInTheDocument();
      expect(errorOf("zip")).not.toBeInTheDocument();
    });

    it("keeps the errors when the app cancels the reset", async () => {
      const { user } = await render(() => (
        <Form
          data-testid="form"
          errors={{ city: "Unknown" }}
          onReset={(event) => event.preventDefault()}
        >
          <TextField name="city" label="City" />
          <button type="reset">Reset</button>
        </Form>
      ));

      await user.click(button("Reset"));
      await afterReset();

      expect(errorOf("city")).toHaveTextContent("Unknown");
    });

    it("shows a new errors object passed by the reset's own handler", async () => {
      const [errors, setErrors] = createSignal<FormErrors>({ city: "Unknown" });
      const { user } = await render(() => (
        <Form
          data-testid="form"
          errors={errors()}
          onReset={() => setErrors({ city: "Closed" })}
        >
          <TextField name="city" label="City" />
          <button type="reset">Reset</button>
        </Form>
      ));

      await user.click(button("Reset"));
      await afterReset();

      expect(errorOf("city")).toHaveTextContent("Closed");
    });

    // A press of the user's, not a script's: the browser runs microtasks
    // as each listener of `reset` returns, before it resets the controls.
    describe.skipIf(isJSDOM)("by a real press", () => {
      const pressReset = () => press(centerOf(button("Reset")));

      it("hides the errors", async () => {
        await render(() => (
          <Form data-testid="form" errors={{ city: "Unknown" }}>
            <TextField name="city" label="City" />
            <button type="reset">Reset</button>
          </Form>
        ));
        expect(errorOf("city")).toBeInTheDocument();

        await pressReset();
        await afterReset();

        expect(errorOf("city")).not.toBeInTheDocument();
      });

      it("keeps the errors for a reset a later listener cancels", async () => {
        await render(() => (
          <Form data-testid="form" errors={{ city: "Unknown" }}>
            <TextField name="city" label="City" />
            <button type="reset">Reset</button>
          </Form>
        ));
        // Added after Form's own listener.
        form().addEventListener("reset", (event) => event.preventDefault());

        await pressReset();
        await afterReset();

        expect(errorOf("city")).toHaveTextContent("Unknown");
      });
    });
  });
});
