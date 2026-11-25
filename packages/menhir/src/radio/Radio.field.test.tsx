// Radio as a Field's Control, through `Field.Control`'s `render`. The test
// list and the cases left out are in README.md.
import { describe, expect, it, vi } from "vitest";

import { afterReset, createRenderer, fireEvent, screen } from "#test-utils";

import { Field } from "../field/index.ts";
import { Form } from "../form/index.ts";
import type { FormErrors } from "../core/formContext.ts";
import { Radio } from "./index.ts";

const group = () => screen.getByRole("radiogroup", { name: "Size" });
const radio = (name: string) => screen.getByRole("radio", { name });
const form = () => screen.getByTestId<HTMLFormElement>("form");
const error = () => screen.queryByTestId("error");
const button = (name: string) => screen.getByRole("button", { name });
const firstInput = () =>
  document.querySelector<HTMLInputElement>("input[type=radio]")!;

/** A required group of sizes as the Control of a Field. */
function Size(props: {
  defaultValue?: string;
  fieldDisabled?: boolean;
  message?: string;
}) {
  return (
    <Field.Root name="size" disabled={props.fieldDisabled} data-testid="root">
      <Field.Control
        required
        // The value props are the group's, not the Field's.
        render={(p) => <Radio.Root {...p} defaultValue={props.defaultValue} />}
      >
        <legend>Size</legend>
        <Field.Description>Pick one.</Field.Description>
        <label>
          <Radio.Item value="s" />
          Small
        </label>
        <label>
          <Radio.Item value="m" />
          Medium
        </label>
        {/* The app's message is for a group with none checked only. */}
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

function SizeForm(
  props: Parameters<typeof Size>[0] & {
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
      <Size {...props} />
      <button type="submit">Send</button>
      <button type="reset">Reset</button>
    </form>
  );
}

describe("<Radio.Root /> in a Field", () => {
  const { render } = createRenderer();

  it("is described by the Field, and its radios submit under the Field's name", async () => {
    const { user } = await render(() => <SizeForm />);

    expect(group().tagName).toBe("FIELDSET");
    expect(group()).toHaveAccessibleDescription("Pick one.");

    await user.click(radio("Medium"));
    expect(new FormData(form()).getAll("size")).toEqual(["m"]);
  });

  it("shows no error before it is touched", async () => {
    await render(() => <SizeForm />);

    expect(group()).not.toHaveAttribute("aria-invalid");
    expect(screen.getByTestId("root")).not.toHaveAttribute("data-invalid");
    expect(error()).toBeNull();
  });

  it("blocks a submission while none is checked, and shows the browser's message as its error", async () => {
    const onSubmit = vi.fn();
    const { user } = await render(() => <SizeForm onSubmit={onSubmit} />);

    await user.click(button("Send"));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(group()).toHaveAttribute("aria-invalid", "true");
    expect(group()).toHaveAttribute("data-invalid", "");
    expect(screen.getByTestId("root")).toHaveAttribute("data-invalid", "");
    expect(error()).toHaveTextContent(firstInput().validationMessage);
    expect(group()).toHaveAccessibleDescription(
      `Pick one. ${firstInput().validationMessage}`,
    );
  });

  it("shows the app's message instead, and hides it once a radio is checked", async () => {
    const onSubmit = vi.fn();
    const { user } = await render(() => (
      <SizeForm message="Pick a size." onSubmit={onSubmit} />
    ));

    await user.click(button("Send"));
    expect(error()).toHaveTextContent("Pick a size.");

    await user.click(radio("Small"));
    expect(error()).toBeNull();
    expect(group()).not.toHaveAttribute("aria-invalid");

    await user.click(button("Send"));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("is touched by focus leaving it, and not by focus moving inside it", async () => {
    const { user } = await render(() => <SizeForm message="Pick a size." />);

    await user.keyboard("[Tab]");
    expect(radio("Small")).toHaveFocus();
    expect(error()).toBeNull();

    await user.keyboard("[Tab]");
    expect(button("Send")).toHaveFocus();
    expect(error()).toHaveTextContent("Pick a size.");
  });

  it("is disabled, with every radio, by the Field's disabled", async () => {
    await render(() => <SizeForm fieldDisabled />);

    expect(group()).toBeDisabled();
    expect(group()).toHaveAttribute("data-disabled", "");
    expect(radio("Small")).toBeDisabled();
    expect(radio("Small")).toHaveAttribute("data-disabled", "");
  });

  it("shows a Form's error under the Field's name at once, and hides it once a radio is checked", async () => {
    const errors: FormErrors = { size: "Medium is sold out." };
    const { user } = await render(() => (
      <Form errors={errors}>
        <Size defaultValue="m" />
      </Form>
    ));

    expect(error()).toHaveTextContent("Medium is sold out.");
    expect(group()).toHaveAttribute("aria-invalid", "true");

    await user.click(radio("Small"));
    expect(error()).toBeNull();
  });

  it("goes back to defaultValue on a reset, and hides the error", async () => {
    const { user } = await render(() => <SizeForm message="Pick a size." />);

    await user.click(button("Send"));
    expect(error()).toHaveTextContent("Pick a size.");
    await user.click(radio("Small"));

    fireEvent.click(button("Reset"));
    await afterReset();

    expect(radio("Small")).toHaveAttribute("aria-checked", "false");
    expect(error()).toBeNull();
    expect(group()).not.toHaveAttribute("data-touched");
  });
});
