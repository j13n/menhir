import { fireEvent, render } from "@solidjs/testing-library";
import { captureArtifact, expectNoDiagnostics } from "@solidjs/diagnostics";
import { onFlush } from "solid-js";
import { describe, expect, test } from "vitest";

import NumberFieldInField from "./NumberFieldInField";

const settled = () => new Promise<void>((resolve) => onFlush(resolve));

describe("the Number Field page's In a Field recipe", () => {
  test("is labelled and described by the Field, submits the plain number under its name, and its error shows once touched", async () => {
    const { artifact } = await captureArtifact(async () => {
      const { getByRole, container, unmount } = render(() => (
        <form>
          <NumberFieldInField />
        </form>
      ));
      const input = getByRole<HTMLInputElement>("spinbutton", {
        name: "Price",
      });
      expect(input).toHaveAccessibleDescription("In half euros.");

      // Required and empty: leaving it touches the field.
      fireEvent.focusOut(input);
      await settled();
      expect(input).toHaveAttribute("aria-invalid", "true");

      // Typed in German, read back on blur.
      fireEvent.input(input, { target: { value: "12,5" } });
      fireEvent.blur(input);
      fireEvent.focusOut(input);
      await settled();
      expect(input).toHaveValue("12,50\u00a0€");
      expect(input).not.toHaveAttribute("aria-invalid");
      expect(new FormData(container.querySelector("form")!).get("price")).toBe(
        "12.5",
      );
      unmount();
    });
    expectNoDiagnostics(artifact);
  });
});
