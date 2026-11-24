import { fireEvent, render } from "@solidjs/testing-library";
import { captureArtifact, expectNoDiagnostics } from "@solidjs/diagnostics";
import { onFlush } from "solid-js";
import { describe, expect, test } from "vitest";

import RadioInField from "./RadioInField";

const settled = () => new Promise<void>((resolve) => onFlush(resolve));

describe("the Radio page's In a Field recipe", () => {
  test("is named and described, submits under the Field's name, and its error shows once touched", async () => {
    const { artifact } = await captureArtifact(async () => {
      const { getByRole, getByText, queryByText, container, unmount } = render(
        () => (
          <form>
            <RadioInField />
          </form>
        ),
      );
      const group = getByRole("radiogroup", { name: "Plan" });
      expect(group).toHaveAccessibleDescription(
        "You can change it at any time.",
      );
      expect(container.querySelectorAll("input[name=plan]")).toHaveLength(2);

      // The browser fires invalid at each hidden radio when it blocks a
      // submission, which touches the field and shows its error.
      fireEvent.invalid(container.querySelector("input[name=plan]")!);
      await settled();
      expect(group).toHaveAttribute("aria-invalid", "true");
      expect(getByText("Choose a plan to go on.")).toBeInTheDocument();

      // The value and the field's own state land after the event's flush
      // (`onFlush`).
      const yearly = getByRole("radio", { name: "Yearly" });
      fireEvent.click(yearly);
      await settled();
      expect(yearly).toHaveAttribute("aria-checked", "true");
      expect(group).not.toHaveAttribute("aria-invalid");
      expect(queryByText("Choose a plan to go on.")).toBeNull();
      unmount();
    });
    expectNoDiagnostics(artifact);
  });
});
