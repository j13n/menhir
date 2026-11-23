// The test list and the cases left out are in README.md: the browser's
// validity, and when an error shows.
import { Loading, createMemo, createSignal, flush } from "solid-js";
import { describe, expect, it } from "vitest";

import { afterFlush, createRenderer, fireEvent, screen } from "#test-utils";

import { Switch } from "../switch/index.ts";
import { Field } from "./index.ts";

const parts = () =>
  ["root", "label", "control", "description"].map((id) =>
    screen.getByTestId(id),
  );

function EmailField(props: { error?: string; invalid?: boolean }) {
  return (
    <Field.Root data-testid="root" error={props.error} invalid={props.invalid}>
      <Field.Label data-testid="label">Email</Field.Label>
      <Field.Control data-testid="control" type="email" required />
      <Field.Description data-testid="description">
        For receipts.
      </Field.Description>
      <Field.Error data-testid="error" />
    </Field.Root>
  );
}

describe("Field validity", () => {
  const { render } = createRenderer();
  const control = () =>
    screen.getByRole("textbox", { name: "Email" }) as HTMLInputElement;
  const error = () => screen.queryByTestId("error");

  describe("from the browser", () => {
    it("is not shown before the field is touched", async () => {
      await render(() => <EmailField />);
      await afterFlush();

      expect(control().validity.valueMissing).toBe(true);
      for (const part of parts()) {
        expect(part).not.toHaveAttribute("data-invalid");
        expect(part).not.toHaveAttribute("data-touched");
      }
      expect(control()).not.toHaveAttribute("aria-invalid");
      expect(error()).toBeNull();
    });

    it("is shown once focus has left the field", async () => {
      const { user } = await render(() => (
        <>
          <EmailField />
          <button type="button">Next</button>
        </>
      ));
      await user.click(control());
      expect(control()).not.toHaveAttribute("data-touched");

      await user.tab();

      for (const part of parts()) {
        expect(part).toHaveAttribute("data-touched", "");
        expect(part).toHaveAttribute("data-invalid", "");
      }
      expect(control()).toHaveAttribute("aria-invalid", "true");
      expect(error()).toHaveTextContent(control().validationMessage);
      expect(control()).toHaveAccessibleDescription(
        `For receipts. ${control().validationMessage}`,
      );
    });

    it("is touched by a press elsewhere on the page", async () => {
      const { user } = await render(() => <EmailField />);
      await user.click(control());

      await user.click(document.body);

      expect(control()).toHaveAttribute("data-touched", "");
      expect(error()).toBeInTheDocument();
    });

    it("is not touched when the window loses focus, which leaves focus on the control", async () => {
      const { user } = await render(() => <EmailField />);
      await user.click(control());

      // What the browser fires as the user switches to another window or
      // tab: no element gains focus, and the control stays focused.
      fireEvent.focusOut(control(), { relatedTarget: null });
      await afterFlush();

      expect(control()).toHaveFocus();
      expect(control()).not.toHaveAttribute("data-touched");
    });

    it("is not touched by focus moving within the field", async () => {
      const { user } = await render(() => (
        <Field.Root data-testid="root">
          <Field.Control aria-label="First" required />
          <input aria-label="Second" />
        </Field.Root>
      ));
      await user.click(screen.getByRole("textbox", { name: "First" }));

      await user.tab();

      expect(screen.getByTestId("root")).not.toHaveAttribute("data-touched");
    });

    it("hides the error as soon as the value is fixed, and shows it again when broken", async () => {
      const { user } = await render(() => <EmailField />);
      await user.click(control());
      await user.tab();
      expect(error()).toBeInTheDocument();

      await user.type(control(), "a@b.co");
      expect(error()).toBeNull();
      expect(control()).not.toHaveAttribute("aria-invalid");
      expect(screen.getByTestId("root")).not.toHaveAttribute("data-invalid");

      await user.clear(control());
      expect(error()).toBeInTheDocument();
      expect(control()).toHaveAttribute("aria-invalid", "true");
    });

    it("is touched by a change, such as a checkbox pressed without focus", async () => {
      await render(() => (
        <Field.Root data-testid="root">
          <Field.Control type="checkbox" aria-label="Terms" required />
          <Field.Error data-testid="error">Accept the terms.</Field.Error>
        </Field.Root>
      ));
      const checkbox = screen.getByRole("checkbox", { name: "Terms" });

      fireEvent.click(checkbox);
      await afterFlush();
      expect(screen.getByTestId("root")).toHaveAttribute("data-touched", "");
      expect(error()).toBeNull();

      fireEvent.click(checkbox);
      await afterFlush();
      expect(error()).toBeInTheDocument();
    });

    it("sees a Switch's hidden input: a required Switch turned on and off shows its error", async () => {
      const { user } = await render(() => (
        <Field.Root name="terms">
          <Field.Label>Terms</Field.Label>
          <Field.Control render={Switch.Root} required />
          <Field.Error data-testid="error">Accept the terms.</Field.Error>
        </Field.Root>
      ));
      const button = screen.getByRole("switch", { name: "Terms" });

      await user.click(button);
      expect(error()).toBeNull();

      await user.click(button);
      expect(error()).toBeInTheDocument();
      expect(button).toHaveAttribute("aria-invalid", "true");
      expect(button).toHaveAccessibleDescription("Accept the terms.");
    });

    // Not `minlength`: browsers set `tooShort` only after an edit by the
    // user, which a scripted one is not, in jsdom and Chromium alike.
    it.for([
      ["pattern", { pattern: "[0-9]+" }, "abc"],
      ["type", { type: "email" }, "nope"],
    ] as const)(
      "shows the browser's message for %s",
      async ([, attributes, typed]) => {
        const { user } = await render(() => (
          <Field.Root>
            <Field.Control aria-label="Code" {...attributes} />
            <Field.Error data-testid="error" />
          </Field.Root>
        ));
        const code = screen.getByRole("textbox", {
          name: "Code",
        }) as HTMLInputElement;

        await user.type(code, typed);
        await user.tab();

        expect(code.validity.valid).toBe(false);
        expect(error()).toHaveTextContent(code.validationMessage);
      },
    );

    it("never counts a disabled control as invalid", async () => {
      const { user } = await render(() => (
        <>
          <Field.Root data-testid="root" disabled>
            <Field.Control aria-label="Name" required />
          </Field.Root>
          <input aria-label="Other" />
        </>
      ));
      await user.click(screen.getByRole("textbox", { name: "Other" }));
      fireEvent.change(screen.getByRole("textbox", { name: "Name" }));
      await afterFlush();

      expect(screen.getByTestId("root")).toHaveAttribute("data-touched", "");
      expect(screen.getByTestId("root")).not.toHaveAttribute("data-invalid");
    });
  });

  describe("from outside", () => {
    it("shows an error only once the field was touched", async () => {
      const { user } = await render(() => <EmailField error="Taken." />);
      await afterFlush();
      expect(error()).toBeNull();
      expect(control()).not.toHaveAttribute("aria-invalid");

      await user.click(control());
      await user.tab();

      expect(error()).toHaveTextContent("Taken.");
      expect(control()).toHaveAttribute("aria-invalid", "true");
    });

    it("marks the field invalid with invalid alone, and an Error with children shows", async () => {
      const { user } = await render(() => (
        <Field.Root data-testid="root" invalid>
          <Field.Control aria-label="Name" />
          <Field.Error>Check this.</Field.Error>
        </Field.Root>
      ));
      await user.click(screen.getByRole("textbox"));
      await user.tab();

      expect(screen.getByTestId("root")).toHaveAttribute("data-invalid", "");
      expect(screen.getByRole("textbox")).toHaveAttribute(
        "aria-invalid",
        "true",
      );
      expect(screen.getByText("Check this.")).toBeInTheDocument();
    });

    it("wins the message over the browser's", async () => {
      const { user } = await render(() => <EmailField error="Taken." />);
      await user.click(control());
      await user.tab();

      expect(control().validity.valueMissing).toBe(true);
      expect(error()).toHaveTextContent("Taken.");
    });

    it("follows changes while touched, and hides once cleared", async () => {
      const [message, setMessage] = createSignal<string | undefined>("Taken.");
      const { user } = await render(() => <EmailField error={message()} />);
      await user.type(control(), "a@b.co");
      await user.tab();
      expect(error()).toHaveTextContent("Taken.");

      setMessage("Too long.");
      flush();
      expect(error()).toHaveTextContent("Too long.");

      setMessage(undefined);
      flush();
      expect(error()).toBeNull();
      expect(control()).not.toHaveAttribute("aria-invalid");
    });

    it("shows an error from an async memo once it resolves", async () => {
      const { user } = await render(() => {
        const taken = createMemo(async () => {
          await new Promise((resolve) => setTimeout(resolve, 10));
          return "Taken.";
        });
        return (
          <Loading fallback={<p>Checking</p>}>
            <EmailField error={taken()} />
          </Loading>
        );
      });
      expect(await screen.findByRole("textbox")).toBeInTheDocument();

      await user.click(control());
      await user.tab();

      // Writes made while the boundary's first render is still committing
      // land once it has.
      expect(await screen.findByTestId("error")).toHaveTextContent("Taken.");
    });
  });
});
