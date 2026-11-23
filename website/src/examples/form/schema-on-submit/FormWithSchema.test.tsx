import { fireEvent, render } from "@solidjs/testing-library";
import { captureArtifact, expectNoDiagnostics } from "@solidjs/diagnostics";
import { onFlush } from "solid-js";
import { describe, expect, test } from "vitest";

import FormWithSchema from "./FormWithSchema";

/** Resolves once the event's flush has run, with the Field's own state. */
const afterFlush = () => new Promise<void>((resolve) => onFlush(resolve));

describe("the Form page's schema recipe", () => {
  test("blocks an empty form, then shows the schema's issues in their Fields, and hides one once edited", async () => {
    const { artifact } = await captureArtifact(async () => {
      const { getByRole, getByLabelText, unmount } = render(() => (
        <FormWithSchema />
      ));
      const email = getByRole<HTMLInputElement>("textbox", { name: "Email" });
      const password = getByLabelText<HTMLInputElement>("Password");
      const confirm = getByLabelText<HTMLInputElement>("Password again");
      const submit = getByRole("button", { name: "Sign up" });

      fireEvent.click(submit);
      await afterFlush();
      expect(email).toHaveAttribute("aria-invalid", "true");
      expect(email).toHaveFocus();

      email.value = "ada@example.com";
      password.value = "short";
      confirm.value = "other";
      fireEvent.click(submit);
      // The schema answers in a microtask.
      await Promise.resolve();
      await afterFlush();
      expect(password).toHaveAccessibleDescription("Use 8 characters or more.");
      expect(confirm).toHaveAccessibleDescription("The passwords differ.");
      expect(email).not.toHaveAttribute("aria-invalid");

      confirm.value = "short";
      fireEvent.input(confirm);
      await afterFlush();
      expect(confirm).not.toHaveAttribute("aria-invalid");
      expect(password).toHaveAttribute("aria-invalid", "true");
      unmount();
    });
    expectNoDiagnostics(artifact);
  });
});
