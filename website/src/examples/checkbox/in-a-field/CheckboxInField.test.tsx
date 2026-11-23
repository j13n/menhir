import { fireEvent, render } from "@solidjs/testing-library";
import { captureArtifact, expectNoDiagnostics } from "@solidjs/diagnostics";
import { onFlush } from "solid-js";
import { describe, expect, test } from "vitest";

import CheckboxInField from "./CheckboxInField";

const settled = () => new Promise<void>((resolve) => onFlush(resolve));

describe("the Checkbox page's In a Field recipe", () => {
  test("is labelled, named and described by the Field, and its error shows once touched", async () => {
    const { artifact } = await captureArtifact(async () => {
      const { getByRole, getByText, queryByText, container, unmount } = render(
        () => <CheckboxInField />,
      );
      const control = getByRole("checkbox", { name: "Accept the terms" });
      expect(control).toHaveAccessibleDescription(
        "You can read them on the next page.",
      );
      expect(container.querySelector("input")).toHaveAttribute("name", "terms");

      // The checked state and the field's own state land after the
      // event's flush (`onFlush`).
      fireEvent.click(control);
      await settled();
      expect(control).toHaveAttribute("aria-checked", "true");
      fireEvent.click(control);
      await settled();
      expect(control).toHaveAttribute("aria-checked", "false");
      expect(control).toHaveAttribute("aria-invalid", "true");
      expect(getByText("Check this to go on.")).toBeInTheDocument();

      fireEvent.click(control);
      await settled();
      expect(control).not.toHaveAttribute("aria-invalid");
      expect(queryByText("Check this to go on.")).toBeNull();
      unmount();
    });
    expectNoDiagnostics(artifact);
  });
});
