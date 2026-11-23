import { fireEvent, render } from "@solidjs/testing-library";
import { captureArtifact, expectNoDiagnostics } from "@solidjs/diagnostics";
import { onFlush } from "solid-js";
import { describe, expect, test } from "vitest";

import InputInField from "./InputInField";

describe("the Input page's In a Field recipe", () => {
  test("is labelled, named and described by the Field, and its error shows once touched", async () => {
    const { artifact } = await captureArtifact(async () => {
      const { getByRole, unmount } = render(() => <InputInField />);
      const control = getByRole<HTMLInputElement>("textbox", {
        name: "Email",
      });
      expect(control).toHaveAttribute("name", "email");
      expect(control).toHaveAccessibleDescription("We send the receipt here.");

      control.value = "ada";
      fireEvent.input(control);
      fireEvent.focusOut(control);
      // The field's own state lands after the event's flush (`onFlush`).
      await new Promise<void>((resolve) => onFlush(resolve));
      expect(control).toHaveValue("ada");
      expect(control).toHaveAttribute("aria-invalid", "true");
      unmount();
    });
    expectNoDiagnostics(artifact);
  });
});
