import { fireEvent, render } from "@solidjs/testing-library";
import { captureArtifact, expectNoDiagnostics } from "@solidjs/diagnostics";
import { onFlush } from "solid-js";
import { describe, expect, test } from "vitest";

import OtpFieldLetters from "./OtpFieldLetters";

const settled = () => new Promise<void>((resolve) => onFlush(resolve));

describe("the OTP Field page's Letters and digits recipe", () => {
  test("takes letters in upper case and digits, with the text keyboard, and drops the dash from a paste", async () => {
    const { artifact } = await captureArtifact(async () => {
      const { getByRole, container, unmount } = render(() => (
        <OtpFieldLetters />
      ));
      const input = getByRole<HTMLInputElement>("textbox", {
        name: "Voucher",
      });
      expect(input).toHaveAttribute("inputmode", "text");

      // A paste lands in the input whole.
      input.focus();
      fireEvent.input(input, { target: { value: "ab1-c2d" } });
      await settled();

      expect(input).toHaveValue("AB1C2D");
      expect(
        Array.from(
          container.querySelectorAll("[aria-hidden]"),
          (box) => box.textContent,
        ).join(""),
      ).toBe("AB1-C2D");
      unmount();
    });
    expectNoDiagnostics(artifact);
  });
});
