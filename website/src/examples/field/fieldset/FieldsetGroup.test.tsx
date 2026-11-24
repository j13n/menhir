import { fireEvent, render } from "@solidjs/testing-library";
import { captureArtifact, expectNoDiagnostics } from "@solidjs/diagnostics";
import { onFlush } from "solid-js";
import { describe, expect, test } from "vitest";

import FieldsetGroup from "./FieldsetGroup";

const settled = () => new Promise<void>((resolve) => onFlush(resolve));

describe("the Field page's Fieldset recipe", () => {
  test("is a group named by its legend and described by the Field, and its error shows once touched", async () => {
    const { artifact } = await captureArtifact(async () => {
      const { getByRole, container, unmount } = render(() => <FieldsetGroup />);
      const group = getByRole("group", { name: "Email me about" });
      expect(group.tagName).toBe("FIELDSET");
      expect(group).toHaveAccessibleDescription("You can change this later.");
      expect(group).not.toHaveAttribute("aria-invalid");

      const releases = getByRole("checkbox", { name: "Releases" });
      // The checked state and the field's own state land after the
      // event's flush (`onFlush`).
      fireEvent.click(releases);
      await settled();
      expect(group).toHaveAttribute("aria-invalid", "true");
      expect(group).toHaveAccessibleDescription(
        "You can change this later. Choose at least one topic.",
      );

      fireEvent.click(getByRole("checkbox", { name: "Events" }));
      await settled();
      expect(group).not.toHaveAttribute("aria-invalid");
      expect(group).toHaveAccessibleDescription("You can change this later.");
      const checked = [
        ...container.querySelectorAll<HTMLInputElement>("input:checked"),
      ];
      expect(checked.map((input) => [input.name, input.value])).toEqual([
        ["topics", "Events"],
      ]);
      unmount();
    });
    expectNoDiagnostics(artifact);
  });
});
