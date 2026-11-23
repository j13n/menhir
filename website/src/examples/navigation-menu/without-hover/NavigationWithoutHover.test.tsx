import { fireEvent, render } from "@solidjs/testing-library";
import { captureArtifact, expectNoDiagnostics } from "@solidjs/diagnostics";
import { flush } from "solid-js";
import { describe, expect, test } from "vitest";

import NavigationWithoutHover from "./NavigationWithoutHover";

/** Lets a Collapsible's own state land: it is written after the flush. */
async function settle() {
  await Promise.resolve();
  flush();
  await Promise.resolve();
  flush();
}

describe("the Navigation Menu page's Without hover recipe", () => {
  test("opens one section at a time, closes on Escape with focus on its button, and when focus leaves", async () => {
    const { artifact } = await captureArtifact(async () => {
      const { getByRole, unmount } = render(() => (
        <>
          <NavigationWithoutHover />
          <button type="button">After</button>
        </>
      ));
      const components = getByRole("button", { name: "Components" });
      const docs = getByRole("button", { name: "Docs" });

      fireEvent.click(components);
      await settle();
      expect(components).toHaveAttribute("aria-expanded", "true");

      fireEvent.click(docs);
      await settle();
      expect(docs).toHaveAttribute("aria-expanded", "true");
      expect(components).toHaveAttribute("aria-expanded", "false");

      const link = getByRole("link", { name: "Getting started" });
      link.focus();
      fireEvent.keyDown(link, { key: "Escape" });
      await settle();
      expect(docs).toHaveAttribute("aria-expanded", "false");
      expect(document.activeElement).toBe(docs);

      fireEvent.click(components);
      await settle();
      const after = getByRole("button", { name: "After" });
      fireEvent.focusOut(components, { relatedTarget: after });
      await settle();
      expect(components).toHaveAttribute("aria-expanded", "false");
      unmount();
    });
    expectNoDiagnostics(artifact);
  });
});
