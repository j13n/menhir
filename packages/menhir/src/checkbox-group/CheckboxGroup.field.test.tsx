// Checkbox Group as a Field's Control, through `Field.Control`'s `render`.
// The test list and the cases left out are in README.md.
import { describe, expect, it, vi } from "vitest";

import { afterReset, createRenderer, fireEvent, screen } from "#test-utils";

import { Field } from "../field/index.ts";
import { Form } from "../form/index.ts";
import type { FormErrors } from "../core/formContext.ts";
import { CheckboxGroup } from "./index.ts";

const group = () => screen.getByRole("group", { name: "Toppings" });
const box = (name: string) => screen.getByRole("checkbox", { name });
const form = () => screen.getByTestId<HTMLFormElement>("form");
const error = () => screen.queryByTestId("error");
const button = (name: string) => screen.getByRole("button", { name });
/** The hidden input that holds the group's `required`, after the group. */
const validityInput = () =>
  document.querySelector<HTMLInputElement>("fieldset + input")!;

/** A required group of toppings as the Control of a Field, in a form. */
function Toppings(props: {
  defaultValue?: string[];
  fieldDisabled?: boolean;
  message?: string;
}) {
  return (
    <Field.Root
      name="toppings"
      disabled={props.fieldDisabled}
      data-testid="root"
    >
      <Field.Control
        required
        // The value props are the group's, not the Field's.
        render={(p) => (
          <CheckboxGroup.Root {...p} defaultValue={props.defaultValue} />
        )}
      >
        <legend>Toppings</legend>
        <Field.Description>Pick at least one.</Field.Description>
        <label>
          <CheckboxGroup.Item value="cheese" />
          Cheese
        </label>
        <label>
          <CheckboxGroup.Item value="olives" />
          Olives
        </label>
        {/* The app's message is for an empty group only. */}
        <Field.Error
          data-testid="error"
          match={props.message ? "valueMissing" : undefined}
        >
          {props.message}
        </Field.Error>
      </Field.Control>
    </Field.Root>
  );
}

function ToppingsForm(
  props: Parameters<typeof Toppings>[0] & {
    onSubmit?: () => void;
  },
) {
  return (
    <form
      data-testid="form"
      onSubmit={(event) => {
        event.preventDefault();
        props.onSubmit?.();
      }}
    >
      <Toppings {...props} />
      <button type="submit">Send</button>
      <button type="reset">Reset</button>
    </form>
  );
}

describe("<CheckboxGroup.Root /> in a Field", () => {
  const { render } = createRenderer();

  it("is described by the Field, and its boxes submit under the Field's name", async () => {
    const { user } = await render(() => <ToppingsForm />);

    expect(group().tagName).toBe("FIELDSET");
    expect(group()).toHaveAccessibleDescription("Pick at least one.");

    await user.click(box("Cheese"));
    await user.click(box("Olives"));
    expect(new FormData(form()).getAll("toppings")).toEqual([
      "cheese",
      "olives",
    ]);
  });

  it("shows no error before it is touched", async () => {
    await render(() => <ToppingsForm />);

    expect(group()).not.toHaveAttribute("aria-invalid");
    expect(screen.getByTestId("root")).not.toHaveAttribute("data-invalid");
    expect(error()).toBeNull();
  });

  it("blocks a submission while empty, and shows the browser's message as its error", async () => {
    const onSubmit = vi.fn();
    const { user } = await render(() => <ToppingsForm onSubmit={onSubmit} />);

    await user.click(button("Send"));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(group()).toHaveAttribute("aria-invalid", "true");
    expect(group()).toHaveAttribute("data-invalid", "");
    expect(screen.getByTestId("root")).toHaveAttribute("data-invalid", "");
    expect(error()).toHaveTextContent(validityInput().validationMessage);
    expect(group()).toHaveAccessibleDescription(
      `Pick at least one. ${validityInput().validationMessage}`,
    );
  });

  it("shows the app's message instead, and hides it once a box is checked", async () => {
    const onSubmit = vi.fn();
    const { user } = await render(() => (
      <ToppingsForm message="Pick a topping." onSubmit={onSubmit} />
    ));

    await user.click(button("Send"));
    expect(error()).toHaveTextContent("Pick a topping.");

    await user.click(box("Olives"));
    expect(error()).toBeNull();
    expect(group()).not.toHaveAttribute("aria-invalid");

    await user.click(button("Send"));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("shows its error once checking and unchecking a box leaves it empty", async () => {
    const { user } = await render(() => (
      <ToppingsForm message="Pick a topping." />
    ));

    await user.click(box("Cheese"));
    await user.click(box("Cheese"));
    expect(error()).toHaveTextContent("Pick a topping.");
  });

  it("is touched by focus leaving it, and not by focus moving inside it", async () => {
    const { user } = await render(() => (
      <ToppingsForm message="Pick a topping." />
    ));

    await user.keyboard("[Tab]");
    expect(box("Cheese")).toHaveFocus();
    await user.keyboard("[Tab]");
    expect(box("Olives")).toHaveFocus();
    expect(error()).toBeNull();

    await user.keyboard("[Tab]");
    expect(button("Send")).toHaveFocus();
    expect(error()).toHaveTextContent("Pick a topping.");
  });

  it("is disabled, with every box, by the Field's disabled", async () => {
    await render(() => <ToppingsForm fieldDisabled />);

    expect(group()).toBeDisabled();
    expect(group()).toHaveAttribute("data-disabled", "");
    expect(box("Cheese")).toBeDisabled();
    expect(box("Cheese")).toHaveAttribute("data-disabled", "");
  });

  it("shows a Form's error under the Field's name at once, and hides it on the next change", async () => {
    const errors: FormErrors = { toppings: "Olives are sold out." };
    const { user } = await render(() => (
      <Form errors={errors}>
        <Toppings defaultValue={["olives"]} />
      </Form>
    ));

    expect(error()).toHaveTextContent("Olives are sold out.");
    expect(group()).toHaveAttribute("aria-invalid", "true");

    await user.click(box("Olives"));
    await user.click(box("Cheese"));
    expect(error()).toBeNull();
  });

  it("goes back to defaultValue on a reset, and hides the error", async () => {
    const { user } = await render(() => (
      <ToppingsForm defaultValue={["cheese"]} message="Pick a topping." />
    ));

    await user.click(box("Cheese"));
    expect(error()).toHaveTextContent("Pick a topping.");

    fireEvent.click(button("Reset"));
    await afterReset();

    expect(box("Cheese")).toHaveAttribute("aria-checked", "true");
    expect(error()).toBeNull();
    expect(group()).not.toHaveAttribute("data-touched");
  });
});
