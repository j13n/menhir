import { fireEvent, render } from "@solidjs/testing-library";
import { captureArtifact, expectNoDiagnostics } from "@solidjs/diagnostics";
import { onFlush } from "solid-js";
import { afterEach, describe, expect, test, vi } from "vitest";

import ProposalForm from "./ProposalForm";

/** Resolves once the event's flush has run, with the Field's own state. */
const afterFlush = () => new Promise<void>((resolve) => onFlush(resolve));

/** Types `text` into a control, as an edit by the user. */
function type(control: HTMLInputElement, text: string) {
  control.value = text;
  fireEvent.input(control);
}

describe("the forms guide's form on a store", () => {
  afterEach(() => vi.useRealTimers());

  test("validates nested and array values by a schema on submit, adds and removes rows, and sends with a pending button", async () => {
    vi.useFakeTimers();
    const { artifact } = await captureArtifact(async () => {
      const { getByRole, queryByRole, unmount } = render(() => (
        <ProposalForm />
      ));
      const textbox = (name: string) =>
        getByRole<HTMLInputElement>("textbox", { name });
      const submit = () =>
        fireEvent.click(getByRole("button", { name: "Send proposal" }));

      // The schema's issues, under nested and array names.
      submit();
      await vi.advanceTimersByTimeAsync(0);
      await afterFlush();
      expect(textbox("Title")).toHaveAccessibleDescription(
        "Give the talk a title.",
      );
      expect(textbox("Your name")).toHaveAccessibleDescription(
        "Enter your name.",
      );
      expect(textbox("Link 1")).toHaveAccessibleDescription(
        "Enter a full address, with https://.",
      );

      // An edit hides that field's error; the others stay.
      type(textbox("Title"), "Standing stones");
      await afterFlush();
      expect(textbox("Title")).not.toHaveAttribute("aria-invalid");
      expect(textbox("Your name")).toHaveAttribute("aria-invalid", "true");

      // Rows are added and removed; no link at all is an error of the form.
      fireEvent.click(getByRole("button", { name: "Add a link" }));
      await afterFlush();
      expect(textbox("Link 2")).toBeInTheDocument();
      fireEvent.click(getByRole("button", { name: "Remove link 2" }));
      fireEvent.click(getByRole("button", { name: "Remove link 1" }));
      await afterFlush();
      expect(queryByRole("textbox", { name: "Link 1" })).toBeNull();
      type(textbox("Your name"), "Ada");
      submit();
      await vi.advanceTimersByTimeAsync(0);
      await afterFlush();
      expect(getByRole("alert")).toHaveTextContent(
        "Add a link to a recording or slides.",
      );

      fireEvent.click(getByRole("button", { name: "Add a link" }));
      await afterFlush();
      type(textbox("Link 1"), "https://example.com/talk");
      submit();
      await vi.advanceTimersByTimeAsync(0);
      await afterFlush();
      expect(getByRole("button", { name: "Sending…" })).toBeDisabled();

      await vi.runAllTimersAsync();
      await afterFlush();
      expect(getByRole("status")).toHaveTextContent(
        "Received: Standing stones",
      );
      expect(getByRole("button", { name: "Send proposal" })).toBeEnabled();
      unmount();
    });
    // The "Sending…" flag is an optimistic value that reverts once the
    // action settles, as the Solid 2.0 cheatsheet builds a process flag;
    // the runtime reports each revert as information, not as a fault.
    expectNoDiagnostics(artifact, { allow: ["OPTIMISTIC_REVERTED"] });
  });

  test("shows a field that depends on another once touched, and a reset empties the form and its errors", async () => {
    vi.useFakeTimers();
    const { artifact } = await captureArtifact(async () => {
      const { getByRole, queryByRole, unmount } = render(() => (
        <ProposalForm />
      ));
      const textbox = (name: string) =>
        getByRole<HTMLInputElement>("textbox", { name });

      type(textbox("Email"), "ada@example.com");
      type(textbox("Email again"), "ada@example.org");
      await afterFlush();
      expect(textbox("Email again")).not.toHaveAttribute("aria-invalid");

      fireEvent.focusOut(textbox("Email again"));
      await afterFlush();
      expect(textbox("Email again")).toHaveAccessibleDescription(
        "The addresses differ.",
      );

      type(textbox("Title"), "Standing stones");
      fireEvent.click(getByRole("button", { name: "Add a link" }));
      await afterFlush();
      type(textbox("Link 2"), "https://example.com");
      await afterFlush();
      fireEvent.click(getByRole("button", { name: "Start again" }));
      await vi.advanceTimersByTimeAsync(0);
      await afterFlush();
      expect(textbox("Title")).toHaveValue("");
      expect(textbox("Email")).toHaveValue("");
      expect(textbox("Email again")).toHaveValue("");
      expect(textbox("Email again")).not.toHaveAttribute("aria-invalid");
      expect(textbox("Link 1")).toHaveValue("");
      expect(queryByRole("textbox", { name: "Link 2" })).toBeNull();
      unmount();
    });
    expectNoDiagnostics(artifact);
  });
});
