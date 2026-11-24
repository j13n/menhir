import { fireEvent, render } from "@solidjs/testing-library";
import { captureArtifact, expectNoDiagnostics } from "@solidjs/diagnostics";
import { onFlush } from "solid-js";
import { describe, expect, test } from "vitest";

import CheckboxGroupInField from "./CheckboxGroupInField";

const settled = () => new Promise<void>((resolve) => onFlush(resolve));

describe("the Checkbox Group page's In a Field recipe", () => {
  test("is named and described, submits under the Field's name, and its error shows once touched", async () => {
    const { artifact } = await captureArtifact(async () => {
      const { getByRole, getByText, queryByText, container, unmount } = render(
        () => <CheckboxGroupInField />,
      );
      const group = getByRole("group", { name: "Email me about" });
      expect(group).toHaveAccessibleDescription("Choose at least one.");
      expect(container.querySelectorAll("input[name=topics]")).toHaveLength(3);

      // The value and the field's own state land after the event's flush
      // (`onFlush`).
      const releases = getByRole("checkbox", { name: "Releases" });
      fireEvent.click(releases);
      await settled();
      expect(releases).toHaveAttribute("aria-checked", "true");
      fireEvent.click(releases);
      await settled();
      expect(group).toHaveAttribute("aria-invalid", "true");
      expect(getByText("Choose a topic to go on.")).toBeInTheDocument();

      fireEvent.click(getByRole("checkbox", { name: "Events" }));
      await settled();
      expect(group).not.toHaveAttribute("aria-invalid");
      expect(queryByText("Choose a topic to go on.")).toBeNull();
      unmount();
    });
    expectNoDiagnostics(artifact);
  });
});
