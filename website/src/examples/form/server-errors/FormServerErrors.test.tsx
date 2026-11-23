import { fireEvent, render } from "@solidjs/testing-library";
import { captureArtifact, expectNoDiagnostics } from "@solidjs/diagnostics";
import { onFlush } from "solid-js";
import { afterEach, describe, expect, test, vi } from "vitest";

import FormServerErrors from "./FormServerErrors";

/** Resolves once the event's flush has run, with the Field's own state. */
const afterFlush = () => new Promise<void>((resolve) => onFlush(resolve));

describe("the Form page's server errors recipe", () => {
  afterEach(() => vi.useRealTimers());

  test("shows the button pending while the server answers, then the server's error in its Field", async () => {
    vi.useFakeTimers();
    const { artifact } = await captureArtifact(async () => {
      const { getByRole, unmount } = render(() => <FormServerErrors />);
      const email = getByRole<HTMLInputElement>("textbox", { name: "Email" });
      const form = email.form!;

      email.value = "ada@example.com";
      fireEvent.click(getByRole("button", { name: "Subscribe" }));
      await afterFlush();
      expect(getByRole("button", { name: "Subscribing…" })).toBeInTheDocument();
      expect(form).toHaveAttribute("aria-busy", "true");

      await vi.runAllTimersAsync();
      await afterFlush();
      expect(getByRole("button", { name: "Subscribe" })).toBeInTheDocument();
      expect(form).not.toHaveAttribute("aria-busy");
      expect(email).toHaveAttribute("aria-invalid", "true");
      expect(email).toHaveAccessibleDescription(
        "Try ada@example.com. This address is subscribed already.",
      );
      unmount();
    });
    // The "Subscribing…" flag is an optimistic value that reverts once the
    // action settles, as the Solid 2.0 cheatsheet builds a process flag;
    // the runtime reports each revert as information, not as a fault.
    expectNoDiagnostics(artifact, { allow: ["OPTIMISTIC_REVERTED"] });
  });
});
