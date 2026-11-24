// Number Field as a Field's Control, through `Field.Control`'s `render`.
// The test list and the cases left out are in README.md.
import { describe, expect, it } from "vitest";

import { afterFlush, createRenderer, isJSDOM, screen } from "#test-utils";

import { Field } from "../field/index.ts";
import { Form } from "../form/index.ts";
import type { FormErrors } from "../core/formContext.ts";
import { NumberField } from "./index.ts";

const spinbutton = () =>
  screen.getByRole<HTMLInputElement>("spinbutton", { name: "Guests" });
const hidden = () =>
  document.querySelector<HTMLInputElement>('input[type="number"]')!;
const error = () => screen.queryByTestId("error");
const button = (name: string) => screen.getByRole("button", { name });

/** A number of guests as the Control of a Field. */
function Guests(props: {
  value?: number | null;
  defaultValue?: number | null;
  disabled?: boolean;
  step?: number;
}) {
  return (
    <Field.Root name="guests" disabled={props.disabled} data-testid="field">
      <Field.Label>Guests</Field.Label>
      <Field.Control
        required
        // The value props are the Number Field's, not the Field's.
        render={(p) => (
          <NumberField.Root
            {...p}
            min={1}
            max={8}
            step={props.step}
            value={props.value}
            defaultValue={props.defaultValue}
            locale="en-US"
          />
        )}
      >
        <NumberField.Decrement aria-label="Fewer" />
        <NumberField.Input />
        <NumberField.Increment aria-label="More" />
      </Field.Control>
      <Field.Description>Up to eight.</Field.Description>
      <Field.Error data-testid="error" />
    </Field.Root>
  );
}

function GuestsForm(props: Parameters<typeof Guests>[0]) {
  return (
    <form data-testid="form" onSubmit={(event) => event.preventDefault()}>
      <Guests {...props} />
      <button type="button">Next</button>
      <button type="submit">Send</button>
    </form>
  );
}

describe("<NumberField.Root /> in a Field", () => {
  const { render } = createRenderer();

  /** Types `text` over the Input's text, then leaves it, which commits. */
  async function typeAndLeave(
    user: Awaited<ReturnType<typeof render>>["user"],
    text: string,
  ) {
    await user.clear(spinbutton());
    if (text) await user.type(spinbutton(), text);
    await user.click(button("Next"));
    await afterFlush();
  }

  it("is labelled by the Label, described by the Description, and submits under the Field's name", async () => {
    await render(() => <GuestsForm defaultValue={2} />);

    expect(spinbutton()).toHaveAccessibleDescription("Up to eight.");
    expect(button("More")).toHaveAttribute("aria-controls", spinbutton().id);
    expect(
      Object.fromEntries(new FormData(screen.getByTestId("form"))),
    ).toEqual({ guests: "2" });
  });

  it("shows the error once touched while required and empty, and hides it once a number is typed", async () => {
    const { user } = await render(() => <GuestsForm />);
    expect(error()).toBeNull();

    await user.click(spinbutton());
    await user.click(button("Next"));
    await afterFlush();

    expect(spinbutton()).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByTestId("field")).toHaveAttribute("data-invalid");
    expect(error()).toBeInTheDocument();

    await typeAndLeave(user, "3");

    expect(spinbutton()).not.toHaveAttribute("aria-invalid");
    expect(error()).toBeNull();
  });

  it("clamps a typed number above max, so no error shows", async () => {
    const { user } = await render(() => <GuestsForm />);

    await typeAndLeave(user, "20");

    expect(spinbutton()).toHaveValue("8");
    expect(error()).toBeNull();
  });

  it("shows the browser's rangeOverflow message for an app's value over max, once touched", async () => {
    const { user } = await render(() => <GuestsForm value={12} />);

    await user.click(button("Send"));
    await afterFlush();

    expect(hidden().validity.rangeOverflow).toBe(true);
    expect(spinbutton()).toHaveAttribute("aria-invalid", "true");
    if (!isJSDOM) {
      expect(error()).toHaveTextContent(hidden().validationMessage);
      expect(hidden().validationMessage).toMatch(/8/);
    }
  });

  it("shows the browser's stepMismatch message for a typed value off the grid, once touched", async () => {
    const { user } = await render(() => <GuestsForm step={2} />);

    await typeAndLeave(user, "4");

    expect(hidden().validity.stepMismatch).toBe(true);
    expect(spinbutton()).toHaveAttribute("aria-invalid", "true");
    if (!isJSDOM) {
      expect(error()).toHaveTextContent(hidden().validationMessage);
    }
  });

  it("is disabled in every part by the Field's disabled", async () => {
    await render(() => <GuestsForm defaultValue={2} disabled />);

    expect(spinbutton()).toBeDisabled();
    expect(button("More")).toBeDisabled();
    expect(button("Fewer")).toBeDisabled();
    expect(hidden()).toBeDisabled();
  });

  it("shows a Form's error under the Field's name at once, and hides it once the value changes", async () => {
    const errors: FormErrors = { guests: "The table seats four." };
    const { user } = await render(() => (
      <Form errors={errors}>
        <Guests defaultValue={6} />
      </Form>
    ));
    expect(error()).toHaveTextContent("The table seats four.");
    expect(spinbutton()).toHaveAttribute("aria-invalid", "true");

    await user.click(button("Fewer"));
    await afterFlush();

    expect(error()).toBeNull();
  });
});
