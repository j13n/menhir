// Checkbox in a Field, through `Field.Control`'s `render`. The test list and
// the cases left out are in README.md.
import { describe, expect, it, vi } from "vitest";

import { createSignal } from "solid-js";

import {
  afterFlush,
  afterReset,
  createRenderer,
  isJSDOM,
  screen,
} from "#test-utils";

import { Field } from "../field/index.ts";
import { Checkbox } from "./index.ts";
import type { CheckboxRootProps } from "./root/CheckboxRoot.tsx";

const checkbox = () => screen.getByRole("checkbox", { name: "Accept terms" });
// Not found by role: it is a checkbox too, and the button is the one
// assistive technology sees.
const hiddenInput = () =>
  document.querySelector<HTMLInputElement>("input[type=checkbox]")!;
const form = () => screen.getByTestId<HTMLFormElement>("form");
const submitted = () => new FormData(form()).getAll("terms");
const error = () => screen.queryByTestId("error");
const button = (name: string) => screen.getByRole("button", { name });

/** A required Checkbox in a Field named `terms`, in a form. */
function TermsForm(
  props: Pick<
    CheckboxRootProps,
    "checked" | "defaultChecked" | "onCheckedChange" | "indeterminate"
  > & {
    onSubmit?: () => void;
    fieldDisabled?: boolean;
    message?: string;
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
      <Field.Root
        name="terms"
        disabled={props.fieldDisabled}
        data-testid="root"
      >
        <Field.Control
          required
          // The value props are the control's, not the Field's.
          render={(p) => (
            <Checkbox.Root
              {...p}
              checked={props.checked}
              defaultChecked={props.defaultChecked}
              onCheckedChange={props.onCheckedChange}
              indeterminate={props.indeterminate}
            />
          )}
        >
          <Checkbox.Indicator data-testid="indicator" />
        </Field.Control>
        <Field.Label data-testid="label">Accept terms</Field.Label>
        <Field.Description>Read them first.</Field.Description>
        <Field.Error data-testid="error">{props.message}</Field.Error>
      </Field.Root>
      <button type="submit">Send</button>
      <button type="reset">Reset</button>
    </form>
  );
}

describe("<Checkbox.Root /> in a Field", () => {
  const { render } = createRenderer();

  it("is labelled and described by the Field, and submits under the Field's name", async () => {
    const { user } = await render(() => <TermsForm />);

    expect(checkbox().tagName).toBe("BUTTON");
    expect(checkbox()).toHaveAccessibleDescription("Read them first.");
    expect(hiddenInput()).toHaveAttribute("name", "terms");
    expect(submitted()).toEqual([]);

    await user.click(screen.getByTestId("label"));

    expect(checkbox()).toHaveAttribute("aria-checked", "true");
    expect(submitted()).toEqual(["on"]);
  });

  it("shows no error before it is touched, though required and unchecked", async () => {
    await render(() => <TermsForm />);
    await afterFlush();

    expect(hiddenInput().validity.valueMissing).toBe(true);
    expect(checkbox()).not.toHaveAttribute("aria-invalid");
    expect(checkbox()).not.toHaveAttribute("data-invalid");
    expect(error()).toBeNull();
  });

  it("blocks a submission while unchecked, and shows the browser's message as its error", async () => {
    const onSubmit = vi.fn();
    const { user } = await render(() => <TermsForm onSubmit={onSubmit} />);

    await user.click(button("Send"));

    expect(onSubmit).not.toHaveBeenCalled();
    const message = hiddenInput().validationMessage;
    expect(message).not.toBe("");
    expect(error()).toHaveTextContent(message);
    expect(checkbox()).toHaveAttribute("aria-invalid", "true");
    expect(checkbox()).toHaveAccessibleDescription(
      `Read them first. ${message}`,
    );
    for (const id of ["root", "label"]) {
      expect(screen.getByTestId(id)).toHaveAttribute("data-invalid", "");
    }
    expect(checkbox()).toHaveAttribute("data-invalid", "");
  });

  it("shows the app's message instead, and hides it once checked, when the form submits", async () => {
    const onSubmit = vi.fn();
    const { user } = await render(() => (
      <TermsForm onSubmit={onSubmit} message="Accept the terms to go on." />
    ));
    await user.click(button("Send"));
    expect(error()).toHaveTextContent("Accept the terms to go on.");

    await user.click(checkbox());

    expect(error()).toBeNull();
    expect(checkbox()).not.toHaveAttribute("aria-invalid");
    await user.click(button("Send"));
    expect(onSubmit).toHaveBeenCalledOnce();
    expect(submitted()).toEqual(["on"]);
  });

  it("shows its error once focus leaves it unchecked", async () => {
    const { user } = await render(() => <TermsForm />);

    await user.tab();
    expect(checkbox()).toHaveFocus();
    await user.tab();

    expect(checkbox()).not.toHaveFocus();
    expect(checkbox()).toHaveAttribute("data-touched", "");
    expect(checkbox()).toHaveAttribute("aria-invalid", "true");
    expect(error()).toBeInTheDocument();
  });

  it("shows its error once checked and unchecked again", async () => {
    const { user } = await render(() => <TermsForm />);

    await user.click(checkbox());
    expect(error()).toBeNull();

    await user.click(checkbox());

    expect(error()).toBeInTheDocument();
    expect(checkbox()).toHaveAttribute("aria-invalid", "true");
  });

  it("blocks a submission while mixed and unchecked, and shows its error, as the form reads checked alone", async () => {
    const onSubmit = vi.fn();
    const { user } = await render(() => (
      <TermsForm indeterminate onSubmit={onSubmit} />
    ));
    expect(checkbox()).toHaveAttribute("aria-checked", "mixed");

    await user.click(button("Send"));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(checkbox()).toHaveAttribute("aria-invalid", "true");
    expect(error()).toBeInTheDocument();
  });

  // The Indicator carries the checkbox's own state; the Field's is on the
  // button around it, which CSS reaches it through (README, "In a Field").
  it("leaves the Field's data-* attributes to the button around the Indicator", async () => {
    const { user } = await render(() => <TermsForm />);
    await user.click(button("Send"));

    const indicator = screen.getByTestId("indicator");
    expect(indicator).toHaveAttribute("data-unchecked", "");
    expect(indicator).toHaveAttribute("data-required", "");
    expect(indicator).not.toHaveAttribute("data-invalid");
    expect(indicator.closest("[data-invalid]")).toBe(checkbox());
  });

  it("takes the Field's disabled: it ignores the user, and the form submits nothing", async () => {
    const { user } = await render(() => (
      <TermsForm fieldDisabled defaultChecked />
    ));

    expect(checkbox()).toBeDisabled();
    expect(hiddenInput()).toBeDisabled();
    expect(checkbox()).toHaveAttribute("data-disabled", "");
    expect(screen.getByTestId("indicator")).toHaveAttribute(
      "data-disabled",
      "",
    );
    await user.click(screen.getByTestId("label"));
    expect(checkbox()).toHaveAttribute("aria-checked", "true");
    expect(submitted()).toEqual([]);
  });

  describe("reset", () => {
    it("goes back to defaultChecked, and hides the error", async () => {
      const { user } = await render(() => <TermsForm defaultChecked />);
      await user.click(checkbox());
      expect(error()).toBeInTheDocument();

      await user.click(button("Reset"));
      await afterReset();

      expect(checkbox()).toHaveAttribute("aria-checked", "true");
      expect(hiddenInput().checked).toBe(true);
      expect(checkbox()).not.toHaveAttribute("data-touched");
      expect(checkbox()).not.toHaveAttribute("aria-invalid");
      expect(error()).toBeNull();
    });

    it("shows no error when the reset leaves it unchecked and invalid, until it is touched again", async () => {
      const { user } = await render(() => <TermsForm />);
      await user.click(checkbox());
      await user.click(button("Send"));

      await user.click(button("Reset"));
      await afterReset();

      expect(checkbox()).toHaveAttribute("aria-checked", "false");
      expect(hiddenInput().validity.valueMissing).toBe(true);
      expect(error()).toBeNull();

      await user.click(button("Send"));
      expect(error()).toBeInTheDocument();
    });

    it("asks a controlled checkbox, and hides the error", async () => {
      const [checked, setChecked] = createSignal(false);
      const onCheckedChange = vi.fn(setChecked);
      const { user } = await render(() => (
        <TermsForm
          checked={checked()}
          defaultChecked
          onCheckedChange={onCheckedChange}
        />
      ));
      await user.click(button("Send"));
      expect(error()).toBeInTheDocument();

      await user.click(button("Reset"));
      await afterReset();

      expect(onCheckedChange).toHaveBeenLastCalledWith(true);
      expect(checkbox()).toHaveAttribute("aria-checked", "true");
      expect(error()).toBeNull();
    });
  });

  // jsdom blocks the submission but does not focus the invalid control.
  it.skipIf(isJSDOM)(
    "moves focus to the checkbox when the browser blocks the submission, which then names its error",
    async () => {
      const { user } = await render(() => <TermsForm />);

      await user.click(button("Send"));

      expect(checkbox()).toHaveFocus();
      expect(checkbox()).toHaveAccessibleDescription(
        `Read them first. ${hiddenInput().validationMessage}`,
      );
    },
  );
});
