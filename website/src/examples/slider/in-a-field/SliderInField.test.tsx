import { fireEvent, render } from "@solidjs/testing-library";
import { captureArtifact, expectNoDiagnostics } from "@solidjs/diagnostics";
import { onFlush } from "solid-js";
import { describe, expect, test } from "vitest";

import SliderInField from "./SliderInField";

const settled = () => new Promise<void>((resolve) => onFlush(resolve));

describe("the Slider page's In a Field recipe", () => {
  test("is labelled and described by the Field, and submits its value under the Field's name", async () => {
    const { artifact } = await captureArtifact(async () => {
      const { getByRole, container, unmount } = render(() => (
        <form>
          <SliderInField />
        </form>
      ));
      const slider = getByRole<HTMLInputElement>("slider", { name: "Volume" });
      expect(slider).toHaveAccessibleDescription(
        "Of the speakers in the room.",
      );
      expect(slider).toHaveAttribute("aria-valuetext", "40");

      fireEvent.keyDown(slider, { key: "ArrowRight" });
      await settled();
      await settled();

      expect(new FormData(container.querySelector("form")!).get("volume")).toBe(
        "41",
      );
      unmount();
    });
    expectNoDiagnostics(artifact);
  });
});
