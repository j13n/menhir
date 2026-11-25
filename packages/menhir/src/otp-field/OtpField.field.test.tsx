// OTP Field as a Field's Control, through `Field.Control`'s `render`.
// The test list and the cases left out are in README.md.
import { Repeat } from "solid-js";
import { describe, expect, it } from "vitest";

import { afterFlush, createRenderer, screen } from "#test-utils";

import { Field } from "../field/index.ts";
import { Form } from "../form/index.ts";
import type { FormErrors } from "../core/formContext.ts";
import { OtpField } from "./index.ts";

const textbox = () =>
  screen.getByRole<HTMLInputElement>("textbox", { name: "Code" });
const error = () => screen.queryByTestId("error");
const button = (name: string) => screen.getByRole("button", { name });

/** A code of four characters as the Control of a Field. */
function Code(props: { defaultValue?: string; disabled?: boolean }) {
  return (
    <Field.Root name="code" disabled={props.disabled} data-testid="field">
      <Field.Label>Code</Field.Label>
      <Field.Control
        required
        // The value props are the OTP Field's, not the Field's.
        render={(p) => (
          <OtpField.Root
            {...p}
            length={4}
            pattern="[0-9A-Z]"
            defaultValue={props.defaultValue}
          />
        )}
      >
        <OtpField.Input />
        <Repeat count={4}>{(index) => <OtpField.Slot index={index} />}</Repeat>
      </Field.Control>
      <Field.Description>From the message we sent.</Field.Description>
      <Field.Error data-testid="error" />
    </Field.Root>
  );
}

function CodeForm(props: Parameters<typeof Code>[0]) {
  return (
    <form data-testid="form" onSubmit={(event) => event.preventDefault()}>
      <Code {...props} />
      <button type="button">Next</button>
      <button type="submit">Send</button>
    </form>
  );
}

describe("<OtpField.Root /> in a Field", () => {
  const { render } = createRenderer();

  /** Types once focused, then leaves the field. */
  async function typeAndLeave(
    user: Awaited<ReturnType<typeof render>>["user"],
    text: string,
  ) {
    textbox().focus();
    if (text) await user.keyboard(text);
    await user.click(button("Next"));
    await afterFlush();
  }

  it("is labelled by the Label, described by the Description, and submits under the Field's name", async () => {
    await render(() => <CodeForm defaultValue="AB12" />);

    expect(textbox()).toHaveAccessibleDescription("From the message we sent.");
    expect(
      Object.fromEntries(new FormData(screen.getByTestId("form"))),
    ).toEqual({ code: "AB12" });
  });

  it("shows the error once touched while required and empty, and hides it once the code is typed", async () => {
    const { user } = await render(() => <CodeForm />);
    expect(error()).toBeNull();

    await typeAndLeave(user, "");

    expect(textbox()).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByTestId("field")).toHaveAttribute("data-invalid");
    expect(error()).toBeInTheDocument();

    await typeAndLeave(user, "ab12");

    expect(textbox()).toHaveValue("AB12");
    expect(textbox()).not.toHaveAttribute("aria-invalid");
    expect(error()).toBeNull();
  });

  it("shows the pattern mismatch once touched for a code that is not full", async () => {
    const { user } = await render(() => <CodeForm />);

    await typeAndLeave(user, "AB");

    expect(textbox().validity.patternMismatch).toBe(true);
    expect(textbox()).toHaveAttribute("aria-invalid", "true");
    expect(error()).toBeInTheDocument();
  });

  it("is disabled by the Field's disabled", async () => {
    await render(() => <CodeForm disabled />);

    expect(textbox()).toBeDisabled();
  });

  it("shows a Form's error under the Field's name at once, and hides it on the next edit", async () => {
    const errors: FormErrors = { code: "That code has expired." };
    const { user } = await render(() => (
      <Form errors={errors}>
        <Code defaultValue="AB12" />
      </Form>
    ));
    expect(error()).toHaveTextContent("That code has expired.");
    expect(textbox()).toHaveAttribute("aria-invalid", "true");

    textbox().focus();
    await user.keyboard("{Backspace}");
    await afterFlush();

    expect(error()).toBeNull();
  });
});
