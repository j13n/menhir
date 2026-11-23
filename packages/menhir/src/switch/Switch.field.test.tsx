// Switch in a Field, through `Field.Control`'s `render`. The test list and
// the cases left out are in README.md.
import { describe, expect, it, vi } from "vitest";

import { createSignal } from "solid-js";

import { afterFlush, createRenderer, isJSDOM, screen } from "#test-utils";

import { Field } from "../field/index.ts";
import { Switch } from "./index.ts";
import type { SwitchRootProps } from "./root/SwitchRoot.tsx";

const switchEl = () => screen.getByRole("switch", { name: "Accept terms" });
const hiddenInput = () =>
  screen.getByRole<HTMLInputElement>("checkbox", { hidden: true });
const form = () => screen.getByTestId<HTMLFormElement>("form");
const submitted = () => new FormData(form()).getAll("terms");
const error = () => screen.queryByTestId("error");
const button = (name: string) => screen.getByRole("button", { name });

/** A required Switch in a Field named `terms`, in a form. */
function TermsForm(
  props: Pick<
    SwitchRootProps,
    "checked" | "defaultChecked" | "onCheckedChange"
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
        <Field.Label data-testid="label">Accept terms</Field.Label>
        <Field.Control
          required
          // The value props are the control's, not the Field's.
          render={(p) => (
            <Switch.Root
              {...p}
              checked={props.checked}
              defaultChecked={props.defaultChecked}
              onCheckedChange={props.onCheckedChange}
            />
          )}
        >
          <Switch.Thumb data-testid="thumb" />
        </Field.Control>
        <Field.Description>Read them first.</Field.Description>
        <Field.Error data-testid="error">{props.message}</Field.Error>
      </Field.Root>
      <button type="submit">Send</button>
      <button type="reset">Reset</button>
    </form>
  );
}

describe("<Switch.Root /> in a Field", () => {
  const { render } = createRenderer();

  it("is labelled and described by the Field, and submits under the Field's name", async () => {
    const { user } = await render(() => <TermsForm />);

    expect(switchEl().tagName).toBe("BUTTON");
    expect(switchEl()).toHaveAccessibleDescription("Read them first.");
    expect(hiddenInput()).toHaveAttribute("name", "terms");
    expect(submitted()).toEqual([]);

    await user.click(screen.getByTestId("label"));

    expect(switchEl()).toHaveAttribute("aria-checked", "true");
    expect(submitted()).toEqual(["on"]);
  });

  it("shows no error before it is touched, though required and off", async () => {
    await render(() => <TermsForm />);
    await afterFlush();

    expect(hiddenInput().validity.valueMissing).toBe(true);
    expect(switchEl()).not.toHaveAttribute("aria-invalid");
    expect(switchEl()).not.toHaveAttribute("data-invalid");
    expect(error()).toBeNull();
  });

  it("blocks a submission while off, and shows the browser's message as its error", async () => {
    const onSubmit = vi.fn();
    const { user } = await render(() => <TermsForm onSubmit={onSubmit} />);

    await user.click(button("Send"));

    expect(onSubmit).not.toHaveBeenCalled();
    const message = hiddenInput().validationMessage;
    expect(message).not.toBe("");
    expect(error()).toHaveTextContent(message);
    expect(switchEl()).toHaveAttribute("aria-invalid", "true");
    expect(switchEl()).toHaveAccessibleDescription(
      `Read them first. ${message}`,
    );
    for (const id of ["root", "label"]) {
      expect(screen.getByTestId(id)).toHaveAttribute("data-invalid", "");
    }
    expect(switchEl()).toHaveAttribute("data-invalid", "");
  });

  it("shows the app's message instead, and hides it once on, when the form submits", async () => {
    const onSubmit = vi.fn();
    const { user } = await render(() => (
      <TermsForm onSubmit={onSubmit} message="Accept the terms to go on." />
    ));
    await user.click(button("Send"));
    expect(error()).toHaveTextContent("Accept the terms to go on.");

    await user.click(switchEl());

    expect(error()).toBeNull();
    expect(switchEl()).not.toHaveAttribute("aria-invalid");
    await user.click(button("Send"));
    expect(onSubmit).toHaveBeenCalledOnce();
    expect(submitted()).toEqual(["on"]);
  });

  it("shows its error once focus leaves it off", async () => {
    const { user } = await render(() => <TermsForm />);

    await user.tab();
    expect(switchEl()).toHaveFocus();
    await user.tab();

    expect(switchEl()).not.toHaveFocus();
    expect(switchEl()).toHaveAttribute("data-touched", "");
    expect(switchEl()).toHaveAttribute("aria-invalid", "true");
    expect(error()).toBeInTheDocument();
  });

  it("shows its error once turned on and off again", async () => {
    const { user } = await render(() => <TermsForm />);

    await user.click(switchEl());
    expect(error()).toBeNull();

    await user.click(switchEl());

    expect(error()).toBeInTheDocument();
    expect(switchEl()).toHaveAttribute("aria-invalid", "true");
  });

  // The Thumb carries the switch's own state; the Field's is on the button
  // around it, which CSS reaches it through (README, "In a Field").
  it("leaves the Field's data-* attributes to the button around the Thumb", async () => {
    const { user } = await render(() => <TermsForm />);
    await user.click(button("Send"));

    const thumb = screen.getByTestId("thumb");
    expect(thumb).toHaveAttribute("data-unchecked", "");
    expect(thumb).toHaveAttribute("data-required", "");
    expect(thumb).not.toHaveAttribute("data-invalid");
    expect(thumb.closest("[data-invalid]")).toBe(switchEl());
  });

  it("takes the Field's disabled: it ignores the user, and the form submits nothing", async () => {
    const { user } = await render(() => (
      <TermsForm fieldDisabled defaultChecked />
    ));

    expect(switchEl()).toBeDisabled();
    expect(hiddenInput()).toBeDisabled();
    expect(switchEl()).toHaveAttribute("data-disabled", "");
    expect(screen.getByTestId("thumb")).toHaveAttribute("data-disabled", "");
    await user.click(screen.getByTestId("label"));
    expect(switchEl()).toHaveAttribute("aria-checked", "true");
    expect(submitted()).toEqual([]);
  });

  describe("reset", () => {
    it("goes back to defaultChecked, and hides the error", async () => {
      const { user } = await render(() => <TermsForm defaultChecked />);
      await user.click(switchEl());
      expect(error()).toBeInTheDocument();

      await user.click(button("Reset"));
      await afterFlush();

      expect(switchEl()).toHaveAttribute("aria-checked", "true");
      expect(hiddenInput().checked).toBe(true);
      expect(switchEl()).not.toHaveAttribute("data-touched");
      expect(switchEl()).not.toHaveAttribute("aria-invalid");
      expect(error()).toBeNull();
    });

    it("shows no error when the reset leaves it off and invalid, until it is touched again", async () => {
      const { user } = await render(() => <TermsForm />);
      await user.click(switchEl());
      await user.click(button("Send"));

      await user.click(button("Reset"));
      await afterFlush();

      expect(switchEl()).toHaveAttribute("aria-checked", "false");
      expect(hiddenInput().validity.valueMissing).toBe(true);
      expect(error()).toBeNull();

      await user.click(button("Send"));
      expect(error()).toBeInTheDocument();
    });

    it("asks a controlled switch, and hides the error", async () => {
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
      await afterFlush();

      expect(onCheckedChange).toHaveBeenLastCalledWith(true);
      expect(switchEl()).toHaveAttribute("aria-checked", "true");
      expect(error()).toBeNull();
    });
  });

  // jsdom blocks the submission but does not focus the invalid control.
  it.skipIf(isJSDOM)(
    "moves focus to the switch when the browser blocks the submission, which then names its error",
    async () => {
      const { user } = await render(() => <TermsForm />);

      await user.click(button("Send"));

      expect(switchEl()).toHaveFocus();
      expect(switchEl()).toHaveAccessibleDescription(
        `Read them first. ${hiddenInput().validationMessage}`,
      );
    },
  );
});
