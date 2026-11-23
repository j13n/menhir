import { fireEvent, render } from "@solidjs/testing-library";
import { captureArtifact, expectNoDiagnostics } from "@solidjs/diagnostics";
import { onFlush } from "solid-js";
import { describe, expect, test } from "vitest";

import SwitchInField from "./SwitchInField";

const settled = () => new Promise<void>((resolve) => onFlush(resolve));

describe("the Switch page's In a Field recipe", () => {
  test("is labelled, named and described by the Field, and its error shows once touched", async () => {
    const { artifact } = await captureArtifact(async () => {
      const { getByRole, getByText, queryByText, unmount } = render(() => (
        <SwitchInField />
      ));
      const control = getByRole("switch", { name: "Accept the terms" });
      expect(control).toHaveAccessibleDescription(
        "You can read them on the next page.",
      );
      expect(getByRole("checkbox", { hidden: true })).toHaveAttribute(
        "name",
        "terms",
      );

      // The switch's and the field's own state land after the event's
      // flush (`onFlush`).
      fireEvent.click(control);
      await settled();
      expect(control).toHaveAttribute("aria-checked", "true");
      fireEvent.click(control);
      await settled();
      expect(control).toHaveAttribute("aria-invalid", "true");
      expect(getByText("Turn this on to go on.")).toBeInTheDocument();

      fireEvent.click(control);
      await settled();
      expect(control).not.toHaveAttribute("aria-invalid");
      expect(queryByText("Turn this on to go on.")).toBeNull();
      unmount();
    });
    expectNoDiagnostics(artifact);
  });
});
