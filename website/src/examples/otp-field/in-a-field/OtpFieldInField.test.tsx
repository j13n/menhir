import { fireEvent, render } from "@solidjs/testing-library";
import { captureArtifact, expectNoDiagnostics } from "@solidjs/diagnostics";
import { onFlush } from "solid-js";
import { describe, expect, test } from "vitest";

import OtpFieldInField from "./OtpFieldInField";

const settled = () => new Promise<void>((resolve) => onFlush(resolve));

describe("the OTP Field page's In a Field recipe", () => {
  test("is labelled and described by the Field, submits the code under its name, and shows its own words once touched", async () => {
    const { artifact } = await captureArtifact(async () => {
      const { getByRole, getByText, queryByText, container, unmount } = render(
        () => (
          <form>
            <OtpFieldInField />
          </form>
        ),
      );
      const input = getByRole<HTMLInputElement>("textbox", { name: "Code" });
      expect(input).toHaveAccessibleDescription("We sent it to your phone.");

      // Required and empty: leaving it touches the field.
      fireEvent.focusOut(input);
      await settled();
      expect(input).toHaveAttribute("aria-invalid", "true");
      expect(getByText("Enter the code.")).toBeInTheDocument();

      fireEvent.input(input, { target: { value: "123" } });
      await settled();
      expect(getByText("Enter all six digits.")).toBeInTheDocument();

      fireEvent.input(input, { target: { value: "123456" } });
      await settled();
      expect(input).not.toHaveAttribute("aria-invalid");
      expect(queryByText("Enter all six digits.")).toBeNull();
      expect(new FormData(container.querySelector("form")!).get("code")).toBe(
        "123456",
      );
      unmount();
    });
    expectNoDiagnostics(artifact);
  });
});
